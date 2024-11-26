---
id: 564
title: "JSON on a diet… how to shrink your DTO’s – Part 1: Default Value Handling"
date: 2015-11-06T15:08:38+01:00
updated: 2021-07-16T22:51:18+02:00
author: Michaël Hompus
excerpt: >
  These days JSON is used a lot.
  For storing data, for storing settings, for describing other JSON files, and often for transporting information between server and client using DTOs (Data Transfer Objects).

  Recently I was monitoring the data transferred from one of my own Web API controllers to a mobile app.
  I discovered the amount of data transferred was way more then expected.
  This inspired me try to reduce the size of the transferred data.
  In this and following blog posts I will describe the different options you can use and combine.

  You can download the source code at the end of my article.
layout: ../layouts/BlogPost.astro
permalink: /2015/11/06/json-on-a-diet-how-to-shrink-your-dtos-part-1-default-value-handling/
image: /wp-content/uploads/2015/11/post-2015-11-06-thumbnail.png
categories:
  - C#
tags:
  - ASP.NET
  - DefaultValue
  - JSON
  - JSON.NET
  - Mobile App Service
  - Web API
---

These days [JSON](https://en.wikipedia.org/wiki/JSON) is used a lot.
For storing data, for storing settings, for describing other JSON files, and often for transporting information between server and client using DTOs ([Data Transfer Objects](https://en.wikipedia.org/wiki/Data_transfer_object)).

When using an [Azure Mobile App Service](https://azure.microsoft.com/en-us/services/app-service/mobile?WT.mc_id=DT-MVP-5004268) or [ASP.NET Web API](https://dotnet.microsoft.com/apps/aspnet/apis) you will see that JSON is the default format to transport data.
When running apps on a PCs with a fixed internet connection data size might not be a hot topic.
But for apps on mobile devices, possibly using slow, limited, or expensive connections you want to save on the amount of data that is transferred.

<!--more-->

Recently I was monitoring the data transferred from one of my own Web API controllers to a mobile app.
I discovered the amount of data transferred was more than expected.

This inspired me try to reduce the size of the transferred data.
In this and following articles I will describe the different options you can use and combine.

You can download the source code at [the end of my article](#source-code).

## Part 1: Default Value Handling

I created an ASP.NET Web API controller to demonstrate the default behavior.
The default controller returns two objects with data, some properties are empty.

A `GET` request to `http://reducejsontraffic.azurewebsites.net/api/default` returns:

```json
[
  {
    "AString": null,
    "AnInt": 0,
    "Fourteen": 14,
    "ANullableByte": null,
    "AStringArray": null,
    "NoUri": null,
    "SomeUri": "http://reducejsontraffic.azurewebsites.net/api/",
    "TheDate": "2015-11-05T17:11:29.0809876+00:00",
    "AnEmptyDate": "0001-01-01T00:00:00",
    "AFixedDate": "2015-07-02T13:14:00+00:00",
    "SingleObject": null,
    "SomeEmptyObjects": [],
    "SomeObjects": [
        { "ADouble": 0 },
        { "ADouble": 3.14 },
        { "ADouble": 1.23456789 }
    ]
  },
  ...
]
```

<small>(Formatted for readability)</small>

As you can see every property is present, despite it does not have a real value.

In ASP.NET Web API, Microsoft has chosen to use the [JSON.net](https://www.newtonsoft.com/json) serializer.
The serializer has a setting called [DefaultValueHandling](https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_DefaultValueHandling.htm) which is set to `Include` by default.
To quote the documentation:

> Include members where the member value is the same as the member's default value when serializing objects.
> Included members are written to JSON.
> Has no effect when deserializing.

And we can confirm this is the case when we look at the result from the first example.

If a property already gets the default value when deserializing, why would we want to transport that value anyway?

## Changing the Default Value Handling

Another option for `DefaultValueHandling` is `Ignore` (and for the serializing part `IgnoreAndPopulate` acts the same).
The documentation states:

> Ignore members where the member value is the same as the member's default value when serializing objects so that it is not written to JSON.
> This option will ignore all default values (e.g., `null` for objects and nullable types; `0` for integers, decimals, and floating-point numbers; and `false` for booleans).
> The default value ignored can be changed by placing the DefaultValueAttribute on the property.

So, when we set this option properties with default values will be removed from the data transferred.

The documentation also mentions the [`DefaultValueAttribute` attribute](https://learn.microsoft.com/dotnet/api/system.componentmodel.defaultvalueattribute?view=netframework-4.7).
So, we can describe a different default for a property.

```csharp title="Message.cs" showlinenumbers startlinenumber=19
[DefaultValue(14)]
public int Fourteen { get; set; }
```

Now the property `Fourteen` will only get serialized when its value is not `14`.

I created a second controller with the modified setting. This controller demonstrates this new behavior.

A `GET` request to `http://reducejsontraffic.azurewebsites.net/api/defaultvaluehandling` returns:

```json
[
  {
    "SomeUri": "http://reducejsontraffic.azurewebsites.net/api/",
    "TheDate": "2015-11-05T17:30:02.3206122+00:00",
    "AFixedDate": "2015-07-02T13:14:00+00:00",
    "SomeEmptyObjects": [],
    "SomeObjects": [
        { "ADouble": 0 },
        {},
        { "ADouble": 1.23456789 }
    ]
  },
  ...
]
```

<small>(Formatted for readability)</small>

That's quite a reduction! But are all values recovered after deserialization?

Yes, if we didn't use the `DefaultValueAttribute` anywhere in our DTO it will work right away.
Otherwise, we will need to tell the serializer explicitly we want to populate the default values on deserialization using the same DefaultValueHandling setting we used on serialization.

I wrote a small console app as a client to show you everything is restored correctly.

When we look at the watch in the debugger, we see all properties not present in the transferred data are populated with either `null` or their correct default value.

![Visual Studio Watch showing a deserialized object with default value handling](/wp-content/uploads/2015/11/visual-studio-watch-default-value-handling.png "Visual Studio Watch showing a deserialized object with default value handling")

## Conclusion

In this example we managed a reduction of 41%.

Of course, the reduction depends heavily on how often default values are part of your transferred data. But it's an easy diet on transferred data that the other side can reconstruct on itself.

## Source code

You can download my [Reduce Json Traffic sample project](https://github.com/eNeRGy164/ReduceJsonTraffic) on GitHub.
