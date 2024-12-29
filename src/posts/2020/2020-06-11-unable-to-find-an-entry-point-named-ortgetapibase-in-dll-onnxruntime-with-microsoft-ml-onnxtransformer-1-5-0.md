---
id: 1451
title: Unable to find an entry point named ‘OrtGetApiBase’ in DLL ‘onnxruntime’ with Microsoft.ML.OnnxTransformer 1.5.0
date: 2020-06-11T08:55:46+02:00
updated: 2021-07-16T22:37:06+02:00
author: Michaël Hompus
excerpt: >
  When trying to have an application work with an ONNX model I downloaded from the Microsoft Custom Vision portal,
  I got the following exception:

  TypeInitializationException: EntryPointNotFoundException: Unable to find an entry point named 'OrtGetApiBase' in DLL 'onnxruntime'.

  Searching for the error online did not yield any solutions.
  After solving the problem, I wanted to share the solution for anyone else running into the same exception.
permalink: /2020/06/11/unable-to-find-an-entry-point-named-ortgetapibase-in-dll-onnxruntime-with-microsoft-ml-onnxtransformer-1-5-0/
image: /wp-content/uploads/2020/06/post-1451-thumbnail.png
categories:
  - C#
  - Machine Learning
tags:
  - Cognitive Services
  - Custom Vision
  - Exception
  - Machine Learning
  - ML.NET
  - ONNX

# cSpell:ignore MKLML
---

When trying to have an application work with an ONNX model I downloaded from the Microsoft [Custom Vision](https://www.customvision.ai/) portal,
I got the following exception:

```plain
System.TypeInitializationException: 'The type initializer for 'Microsoft.ML.OnnxRuntime.NativeMethods' threw an exception.'

EntryPointNotFoundException: Unable to find an entry point named 'OrtGetApiBase' in DLL 'onnxruntime'.
```

Searching for the error online did not yield any solutions.

After solving the problem, I wanted to share the solution for anyone else running into the same exception.

<!--more-->

## The premise

I started with following
[the tutorial how to Detect objects using ONNX in ML.NET](https://learn.microsoft.com/dotnet/machine-learning/tutorials/object-detection-onnx).

The tutorial instructs you to install the following NuGet packages:

- `Microsoft.ML`
- `Microsoft.ML.ImageAnalytics`
- `Microsoft.ML.OnnxTransformer`

It does not mention any other dependencies to add, or steps to take, to make the application run.

## The problem

I was very unlucky in my timing, as the Microsoft machine learning libraries got updated to
[version 1.5.0](https://github.com/dotnet/machinelearning/releases/tag/v1.5.0) on May 27,
that's 2 weeks before I started working on the application.

Before version 1.5.0 the `Microsoft.ML.OnnxTransformer` package had a dependency on
`Microsoft.ML.OnnxRuntime` >= 0.5.1. But version 1.5.0 now has a dependency on `Microsoft.ML.OnnxRuntime.Managed`.

The [release notes of ONNX Runtime v1.2.0](https://github.com/microsoft/onnxruntime/releases/tag/v1.2.0)
are mentioning the change in package structure:

> Nuget package structure updated. There is now a separate Managed Assembly (Microsoft.ML.OnnxRuntime.Managed)
> shared between the CPU and GPU Nuget packages.
> The "native" Nuget will depend on the "managed" Nuget to bring it into relevant projects automatically.  
> …  
> Note that this should transparent for customers installing the Nuget packages.

Commenting on the last remark, it is transparent,
if you would start with the `Microsoft.ML.OnnxRuntime` as it now depends on the `Managed` one.
But the `Microsoft.ML.OnnxTransformer` package doesn't depend directly on the `Microsoft.ML.OnnxRuntime`
as the authors of that package allow the developer to be free to choose between a CPU or GPU runtime.

That the package structure change would result in a runtime exception and confused developers was
[predicted in the GitHub issue](https://github.com/microsoft/onnxruntime/issues/2184#issuecomment-550099935)
introducing this change.

## The solution

Now knowing I was missing the actual runtime, it is an easy fix,
just add _one_ of the runtime packages to your solution:

- `Microsoft.ML.OnnxRuntime`
- `Microsoft.ML.OnnxRuntime.Gpu`
- `Microsoft.ML.OnnxRuntime.MKLML`

Now my application works, and I can start classifying images locally.
