---
id: 1899
title: Using the OpenCV VideoCapture class with the name of a Camera
date: 2021-01-04T13:25:09+01:00
updated: 2023-03-20T21:30:36+01:00
author: Michaël Hompus
excerpt: >
  To capture images in my applications, I use the VideoCapture class of the EmguCV library, an OpenCV wrapper for .NET.

  To choose a specific camera, you need to supply an index value.
  But getting this number is not straightforward,
  and as this number can change over time, it might break your application in the future.

  So, what if we could use the actual name of the camera instead of the index value?

  In this article I will show how to achieve this.
layout: ../layouts/BlogPost.astro
permalink: /2021/01/04/using-the-opencv-videocapture-class-with-the-name-of-a-camera/
image: /wp-content/uploads/2021/01/post-1899-thumbnail.jpg
categories:
  - C#
tags:
  - Camera
  - dotnet
  - EmguCV
  - GitHub
  - Image Processing
  - NuGet
  - OpenCV
  - VideoCapture
---

Capturing images in your applications with the [`VideoCapture` class][VIDEOCAPTURE_CLASS] of the [EmguCV][EMGUCV] library
(an [OpenCV][OPENCV] wrapper for dotnet) requires supplying an index value to choose a specific camera.  
However, finding this number can be challenging, and since it can change over time, it might cause your application to break.

In this article, I will demonstrate how to use the actual name of the camera instead of the index value with OpenCV's `VideoCapture` class.

<!--more-->

## Capture an image

To start, this is the code to capture an image with the `VideoCapture` class.

```csharp
using Emgu.CV;

var capture = new VideoCapture(1, VideoCapture.API.DShow);
using (var frame = capture.QueryFrame())
{
  frame.Save("frame.jpg");
}
```

The code saves the frame from input `1` to the `frame.jpg` file.

How do I know that I need the value of `1`?  
Just by trial and error.

A couple of weeks ago the value was `0`.
I am not sure why Windows decided to change the order of devices,
but it happened, and my application broke.

## Enumerate video input devices

Getting the list of video devices with .NET is not as easy as it might sound.
To enumerate devices, we will have to fall back to the world of COM interop and magic values.

This is done with the [System Device Enumerator][SYSTEM_DEVICE_ENUMERATOR].
Creating the enumerator will return an object that implements the [`ICreateDevEnum` interface][ICREATEDEVENUM_INTERFACE].
This interface needs to be declared first.

```csharp
[ComImport]
[Guid("29840822-5B84-11D0-BD3B-00A0C911CE86")]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface ICreateDevEnum
{
  [PreserveSig]
  int CreateClassEnumerator(
    [In] ref Guid deviceClass,
    [Out] out IEnumMoniker enumMoniker,
    [In] int flags
  );
}
```

It is possible to get the correct C# type using the correct GUID value.
With the type available, create an instance.

```csharp
var comType = Type
  .GetTypeFromCLSID(new Guid("62BE5D10-60EB-11D0-BD3B-00A0C911CE86"));
var systemDeviceEnumerator = (ICreateDevEnum)Activator.CreateInstance(comType);
```

Now it is possible to enumerate all system devices.
In this case we only want video input devices.
Provide the value of the video input device class to filter the enumerator.

```csharp
var videoInputDeviceClass = new Guid("860BB310-5D01-11D0-BD3B-00A0C911CE86");

var hresult = systemDeviceEnumerator
  .CreateClassEnumerator( ref videoInputDeviceClass, out var enumMoniker, 0);

if (hresult == 0)
{
  // Successful
}
```

If there are no errors creating the enumerator, it is now possible to do some enumeration.
Loop until there are no devices left.

```csharp
var moniker = new IMoniker[1];

while (true)
{
    hresult = enumMoniker.Next(1, moniker, IntPtr.Zero);
    if (hresult == 0 && moniker[0] != null)
    {
        // moniker[0] is a pointer to a video input device
    }
}
```

## Get the friendly name of the device

With the moniker, it is possible to get more information about the device.
This information is stored in a property bag.

To access the property bag, first declare a `IPropertyBag` interface.

```csharp
[ComImport]
[Guid("55272A00-42CB-11CE-8135-00AA004BB851")]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPropertyBag
{
    [PreserveSig]
    int Read(
        [In, MarshalAs(UnmanagedType.LPWStr)] string propertyName,
        [In, Out, MarshalAs(UnmanagedType.Struct)] ref object value,
        [In] IntPtr errorLog
    );

    [PreserveSig]
    int Write(
        [In, MarshalAs(UnmanagedType.LPWStr)] string propertyName,
        [In, MarshalAs(UnmanagedType.Struct)] ref object value
    );
}
```

The property bag can be bound to the moniker.
Use the `Read` method to query for the `FriendlyName` property.

```csharp
var bagId = typeof(IPropertyBag).GUID;

moniker.BindToStorage(null, null, ref bagId, out object bagObject);
var propertyBag = (IPropertyBag)bagObject;

object value = null;
var hresult = propertyBag.Read("FriendlyName", ref value, IntPtr.Zero);
if (hresult == 0)
{
    // value holds the friendly name
}
```

## Put it all together

I have put all the bits together and shared [this code on GitHub][GITHUB_REPO].
I also provided this solution as a [NuGet package][NUGET_PACKAGE] for convenience.

As a consumer, I can use the name of my device to get the index and create an instance of the `VideoCapture` class.

```csharp {10}
using Emgu.CV;
using Hompus.VideoInputDevices;

VideoCapture capture;

using (var sde = new SystemDeviceEnumerator())
{
    var devices = sde.ListVideoInputDevice();

    var index = devices.First(d => d.Value == "Cam Link 4K").Key;
    capture = new VideoCapture(index, VideoCapture.API.DShow);
}

using (var frame = capture.QueryFrame())
{
    frame.Save("frame.jpg");
}
```

If you have any improvements on the code, please open an issue and/or submit a pull request.

[VIDEOCAPTURE_CLASS]: https://docs.opencv.org/4.5.1/d8/dfe/classcv_1_1VideoCapture.html
[EMGUCV]: http://www.emgu.com/
[OPENCV]: https://opencv.org/
[SYSTEM_DEVICE_ENUMERATOR]: https://learn.microsoft.com/windows/win32/directshow/using-the-system-device-enumerator
[ICREATEDEVENUM_INTERFACE]: https://learn.microsoft.com/windows/win32/api/strmif/nn-strmif-icreatedevenum
[GITHUB_REPO]: https://github.com/eNeRGy164/VideoInputDevices
[NUGET_PACKAGE]: https://www.nuget.org/packages/Hompus.VideoInputDevices/
