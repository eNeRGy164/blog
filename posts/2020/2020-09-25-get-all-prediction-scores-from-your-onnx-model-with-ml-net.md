---
id: 1640
title: Get all prediction scores from your ONNX model with ML.NET
date: 2020-09-25T16:05:28+02:00
updated: 2021-07-16T22:32:22+02:00
author: Michaël Hompus
excerpt: >
  Recently I wrote an article about getting all prediction scores from your ML.NET model.
  So, when we want to do this for an ONNX model we have loaded with ML.NET,
  that should work the same, right?

  Not really. Depending on the version of ML.NET,
  the data types of the downloaded Azure Custom Vision ONNX model are very hard to map on the .NET data types we use.

  In this article I will show how we can get the labels and scores from an ONNX model prediction in C#.
permalink: /2020/09/25/get-all-prediction-scores-from-your-onnx-model-with-ml-net/
image: /wp-content/uploads/2020/09/post-2020-09-25-thumbnail.png
categories:
  - C#
  - Machine Learning
tags:
  - CSharp
  - Custom Vision
  - Machine Learning
  - ML.NET
  - ONNX
  - Prediction
---

Recently I wrote [an article about getting all prediction scores from your ML.NET model](/2020/09/14/get-all-prediction-scores-from-your-ml-net-model).
So, when we want to do this for an ONNX model we have loaded with ML.NET,
that should work the same, right?

Not really. Depending on the version of [ML.NET](https://dotnet.microsoft.com/en-us/apps/ai/ml-dotnet),
the data types of the downloaded [Azure Custom Vision](https://www.customvision.ai/) ONNX model are very hard to map on the .NET data types we use.

In this article I will show how we can get the labels and scores from an ONNX model prediction in C#.

<!--more-->

> [!NOTE]
> In [my article on classifying a bitmap with a downloaded ONNX model](/2020/06/19/classify-a-bitmap-with-your-downloaded-custom-vision-onnx-model),
> I have described how to set up the code to get predictions from the model.
> In this article we will build on top of that code.

## The prediction engine

Let us start with creating an instance of the prediction engine as we did in the previous post.
The engine is loaded with a model that we exported from the custom vision portal.

```csharp
var mlContext = new MLContext();

var transformer = mlContext.Transforms
  .ResizeImages("image", 224, 224, "Image")
  .Append(mlContext.Transforms.ExtractPixels("data", "image"))
  .Append(
    mlContext.Transforms.ApplyOnnxModel("classLabel", "data", "model.onnx")
  )
  .Fit(mlContext.Data.LoadFromEnumerable(new List<ImageInputData>()));

var predictionEngine = mlContext.Model
  .CreatePredictionEngine<ImageInputData, ImagePrediction>(transformer);
```

At this moment, the `ImagePrediction` class holds only the predicted label.
For this article, the `ImageInputData` class is not relevant.

```csharp
public class ImagePrediction
{
  [ColumnName("classLabel")]
  public string[] Labels;
}
```

Calling the `Predict` method on the engine will return a `ImagePrediction` object
with `Labels` holding the value of the highest scoring label.

```csharp
var modelOutput = this.predictionEngine.Predict(inputData);
// modelOutput.Labels[0] <- highest scoring label
```

## Getting the scores

I have already written what the benefit of getting the scores on your prediction is in the previous article, but to repeat myself:

> Trusting the model and accepting the highest score blindly might not be wise.
> If none of the labels really match, all values are close to 0%.
> And you get the label that scored just a tiny bit better than the others.
> You might see strange behavior in your application as prediction might be random and/or completely wrong.
>
> To prevent this, consider a threshold that needs to be exceeded before accepting the prediction for further use.
> But in the current model, there is no score. So how can we retrieve a prediction score?
>
> – [Get all prediction scores from your ML.NET model](/2020/09/14/get-all-prediction-scores-from-your-ml-net-model)

### Extending the output model

First, extend the model to get all scores back. And here it gets interesting.
In [Netron](https://netron.app/), the datatype of the `loss` property is shown as a `sequence` of `map`s with a `string` key and a `float` value.

![Screenshot of Netron showing the output properties.](/wp-content/uploads/2020/09/netron-output-properties.png "Output properties as shown in Netron.")

Extend the class with the loss property.

```csharp {6-7}
private class ImagePrediction
{
  [ColumnName("classLabel")]
  public string[] Labels { get; set; }

  [ColumnName("loss")]
  public List<Dictionary<string, float>> Scores { get; set; }
}
```

We must also make sure the transformer will output the `loss` property as a column. For this we need to change the parameters of the `ApplyOnnxModel` method.

```csharp {4-8}
var transformer = mlContext.Transforms
  .ResizeImages("image", 224, 224, "Image")
  .Append(mlContext.Transforms.ExtractPixels("data", "image"))
  .Append(
    mlContext.Transforms.ApplyOnnxModel(
      new[] { "classLabel", "loss" },
      new[] { "data" }, "model.onnx")
  )
  .Fit(mlContext.Data.LoadFromEnumerable(new List<ImageInputData>()));
```

## The issue

Then running the code, this will result in the following runtime exception:

```plain
System.ArgumentOutOfRangeException: 'Could not determine an IDataView type for member Scores (Parameter 'rawType')'
```

Changing the data types to an array or any of the different collection types did not seems to matter.
Also specifying a [`OnnxSequenceTypeAttribute` class](https://learn.microsoft.com/dotnet/api/microsoft.ml.transforms.onnx.onnxsequencetypeattribute)
with several data types did not resolve the situation.

Sometimes a different exception is thrown, but this is not helping to get it resolved.

```plain
System.InvalidOperationException: 'Can't bind the IDataView column 'loss' of type 'Microsoft.ML.Transforms.Onnx.OnnxSequenceType' to field or property 'Scores' of type 'IEnumerable`1[Dictionary`2[String, Single]]'.'
```

Looking at the source code of the
[`OnnxTypeParser` class](https://github.com/dotnet/machinelearning/blob/main/src/Microsoft.ML.OnnxTransformer/OnnxTypeParser.cs),
we can find some interesting lines of code and comments that can get us on the right track.

```csharp {5-6,11}
…

else if (typeProto.ValueCase == OnnxCSharpToProtoWrapper.TypeProto.ValueOneofCase.SequenceType)
{
    // Now, we see a Sequence in ONNX. If its element type is T, the variable produced by
    // ONNXRuntime would be typed to IEnumerable<T>.
…

else if (typeProto.ValueCase == OnnxCSharpToProtoWrapper.TypeProto.ValueOneofCase.MapType)
{
    // Entering this scope means a ONNX Map (equivalent to IDictionary<>) will be produced.
```

So, it seems that sequences are tightly connected to `IEnumerable`,
and maps are tightly connected to `IDictionary`.
Any deviation from this will result in an exception.

So, let us change the datatype to `IEnumerable<IDictionary<string, float>>`
and set the `OnnxSequenceTypeAttribute` to `IDictionary<string, float>`.

```csharp {7-8}
private class ImagePrediction
{
    [ColumnName("classLabel")]
    public string[] Labels { get; set; }

    [ColumnName("loss")]
    [OnnxSequenceType(typeof(IDictionary<string, float>))]
    public IEnumerable<IDictionary<string, float>> Scores { get; set; }
}
```

This removes the exception, and the prediction now holds a lot more information.

### ML.NET 1.5.1+

With the release of ML.NET 1.5.1, when the `OnnxSequenceTypeAttribute` is not defined on the `Scores` property,
a much more helpful exception is thrown:

```plain {2}
System.ArgumentOutOfRangeException: 'The expected type 'IEnumerable`1[IDictionary`2[String, Single]]' does not match the type of the 'loss' member: 'List`1[IDictionary`2[String, Single]]'.
Please change the loss member to 'IEnumerable`1[IDictionary`2[String, Single]]' (Parameter 'actualType')'
```

This is a great improvement if you run into this exact situation.

As of version [1.5.2](https://github.com/dotnet/machinelearning/releases/tag/v1.5.2),
this same exception is now also thrown if the `OnnxSequenceTypeAttribute` _is_ defined, awesome!

## Using the scores

With everything wired up correctly,
it is now easy to get the actual score of the highest scoring label.

```csharp
var label = modelOutput.Labels[0];
var score = modelOutput.Scores.First()[modelOutput.Labels[0]];
```

Or if we want to get top scoring labels,
we can sort the dictionary and take the top ten.

```csharp
var top10scores = modelOutput.Scores
  .First()
  .OrderByDescending(kv => kv.Value)
  .Take(10);
```

For ONNX models in ML.NET, the mapping of data types is a little tricky,
but knowing how to define this correctly,
we can do more with a prediction than only taking the highest scoring label.
