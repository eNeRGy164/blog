---
id: 1565
title: "When your ML.NET training data does not fit: ‘The asynchronous operation has not completed’"
date: 2020-08-05T18:15:12+02:00
updated: 2021-07-16T22:33:52+02:00
author: Michaël Hompus
excerpt: >
  When you have created a machine learning model, you will retrain that model when new data is available.
  But when I recently added a couple of images to the training set of my own ML.net model,
  I was faced with the following exception:

  System.InvalidOperationException: 'The asynchronous operation has not completed.'

  The application did work for weeks, so what has changed? And more importantly, how to fix this situation?
permalink: /2020/08/05/when-your-ml-net-training-data-does-not-fit-the-asynchronous-operation-has-not-completed/
image: /wp-content/uploads/2020/08/post-2020-08-05-thumbnail.png
categories:
  - C#
  - Machine Learning
tags:
  - CSharp
  - dotnet
  - Exception
  - Machine Learning
  - ML.NET
---

When you have created a machine learning model, you will retrain that model when new data is available.
But when I recently added a couple of images to the training set of my own [ML.NET](https://dotnet.microsoft.com/apps/ai/ml-dotnet) model,
I was faced with the following exception:

```plain
System.InvalidOperationException: 'The asynchronous operation has not completed.'
```

The application did work for weeks, so what has changed? And more importantly, how to fix this situation?

<!--more-->

## Finding the problem

The offending code is inside the [`Fit` method](https://learn.microsoft.com/dotnet/api/microsoft.ml.iestimator-1.fit),
which is part of my preprocessing pipeline.

```csharp {5}
var imageData = mlContext.Data.LoadFromEnumerable(images);
var shuffledData = mlContext.Data.ShuffleRows(imageData);

var preprocessedData = preprocessingPipeline
    .Fit(shuffledData)
    .Transform(shuffledData);
```

When searching for this exception message, I found a [GitHub issue](https://github.com/dotnet/machinelearning/issues/5312) mentioning this exact exception.
[Jon Wood](https://jonwood.co/) mentions a change introduced in version `1.5.1` of the NuGet package as the cause of this exception.
However, I am still on version `1.5.0`, so maybe these causes are not really related?

## Get it running again

Of course, I first tried if upgrading from version `1.5.0` to version `1.5.1` would help.
But not very surprisingly, this did not remove the exception.

As the fix for the GitHub issue is already merged back, it will be part of version `1.5.2`.
As this version is not yet available, I added the [daily NuGet feed](https://pkgs.dev.azure.com/dnceng/public/_packaging/MachineLearning/nuget/v3/index.json)
and tested with the daily preview version `1.5.2-29129-1`.

Now the exception is gone! Great.

## Moving forward

You will have to wait until the machine learning team releases version `1.5.2` of the [Microsoft.ML](https://www.nuget.org/packages/Microsoft.ML) NuGet package.

However, if you are in a hurry, you can use the preview version of the NuGet package as I did.
Another work-around might be to limit the size of your sample set.
For my data set it seems `1046` is the magic number.

```csharp
var imageData = mlContext.Data.LoadFromEnumerable(images.Take(1_046)); // also works
```

Although this might not be ideal if you have a much larger data set.
