---
id: 1626
title: Get all prediction scores from your ML.NET model
date: 2020-09-14T15:41:27+02:00
updated: 2021-07-16T22:33:08+02:00
author: Michaël Hompus
excerpt: >
  When predicting with an ML.NET model you trained yourself,
  you might be interested in just more than the highest scoring label.
  But how do you get the other labels and their corresponding scores?

  In this article I will show how to you can get these values.
permalink: /2020/09/14/get-all-prediction-scores-from-your-ml-net-model/
image: /wp-content/uploads/2020/09/post-2020-09-14-thumbnail.png
categories:
  - C#
  - Machine Learning
tags:
  - Machine Learning
  - ML.NET
  - Model
  - Prediction
  - Scores
---

When predicting with an [ML.NET](https://dotnet.microsoft.com/apps/ai/ml-dotnet) model you trained yourself,
you might be interested in just more than the highest scoring label.
But how do you get the other labels and their corresponding scores?

In this article I will show how to you can get these values.

<!--more-->

> [!NOTE]
> I am not the first one to answer this question.
> During my research I found the insightful article "[Getting Scores and Runners-Up in ML.NET Multiclass Applications](http://engineering.locai.io/getting-scores-and-runners-up-in-ml-net-multi-class-applications/)" by [Steve Smock](http://engineering.locai.io/author/steve/).
> But as these examples were written in F#,
> I felt encouraged to write this article with C# in the examples.

## The prediction engine

Let us start with creating an instance of the prediction engine.
The engine is loaded with a model that was exported as a zip file at the end of the training stage.

```csharp
var mlContext = new MLContext();

var transformer = mlContext.Model.Load("model.zip", out _);
var predictionEngine =
    mlContext.Model.CreatePredictionEngine<ModelInput, ModelOutput>(transformer);
```

At this moment, the `ModelOutput` class holds only the predicted label.
For this article, the `ModelInput` class is not relevant.

```csharp
public class ModelOutput
{
  public string PredictedLabel { get; set; }
}
```

Calling the `Predict` method on the engine will return a `ModelOutput` object with `PredictionLabel` holding the value of the highest scoring label.

```csharp
var modelOutput = this.predictionEngine.Predict(modelInput);
// modelOutput.PredictedLabel <- highest scoring label
```

## Getting the scores

Trusting the model and accepting the highest score blindly might not be wise.
If none of the labels really match, all values are close to 0%.
And you get the label that scored just a tiny bit better than the others.

You might see strange behavior in your application as prediction might be random and/or completely wrong.

To prevent this, consider a threshold that needs to be exceeded before accepting the prediction for further use.
But in the current model, there is no score.
So how can we retrieve a prediction score?

### Extending the output model

First, extend the model to get all scores back.
This can be done by extending the output schema.
The scores are an array of floats with the name `Score`.

> [!NOTE]
> In C# `float` is an alias for [`Single`](https://learn.microsoft.com/dotnet/api/system.single)

```csharp {4}
public class ModelOutput
{
  public string PredictedLabel { get; set; }
  public float[] Score { get; set; }
}
```

Just having a list of scores does not hold much value, as there is no indication to which label each score is connected.
This information is not part of the prediction output.

### Retrieving the labels

Every label that can be part of the output of the prediction engine is listed in the output schema.
We need specifically the schema for the `Score` column. The labels are stored in the annotation named `SlotNames`.

The datatype of this annotation is not straightforward.
We need to load the data in a
[`VBuffer`](https://learn.microsoft.com/dotnet/api/microsoft.ml.data.vbuffer-1) of
[`ReadOnlyMemory`](https://learn.microsoft.com/dotnet/api/system.readonlymemory-1?) of
[`Char`](https://learn.microsoft.com/dotnet/api/system.char)!
When the data is in the buffer, it is possible to extract all labels and convert them to an array of
[`String`](https://learn.microsoft.com/dotnet/api/system.string).

```csharp
var labelBuffer = new VBuffer<ReadOnlyMemory<char>>();
predictionEngine.OutputSchema["Score"].Annotations.GetValue("SlotNames", ref labelBuffer);

var labels = labelBuffer.DenseValues().Select(l => l.ToString()).ToArray();
```

Now it is possible to work with the labels and scores.

## Using the scores

We can get the score of the highest scoring label by first getting the index of the predicted
label in the array of all labels and use that index on the list of scores.

```csharp
var index = Array.IndexOf(labels, modelOutput.PredictedLabel);
var score = modelOutput.Score[index];
```

Or if we want to get top scoring labels,
we can mash the two lists together in a dictionary,
sort them and take the top ten.

```csharp
var top10scores = this.labels
  .ToDictionary(
    l => l,
    l => (decimal)modelOutput.Score[Array.IndexOf(this.labels, l)]
  )
  .OrderByDescending(kv => kv.Value)
  .Take(10);
```

This shows how to do more with a prediction than only taking the highest scoring label.
