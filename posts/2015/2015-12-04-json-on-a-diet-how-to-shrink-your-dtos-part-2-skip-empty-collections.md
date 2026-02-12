---
id: 572
title: "JSON on a diet… how to shrink your DTO’s – Part 2: Skip empty collections"
date: 2015-12-04T18:19:03+01:00
updated: 2020-12-06T19:47:30+01:00
author: Michaël Hompus
excerpt: >
  This is the second part in a series of posts about reducing the amount of data transferred between ASP.NET Web API or Azure Mobile App Service and the (mobile) client.

  In this post we will squeeze a little bit more from our DTOs (Data Transfer Objects).
permalink: /2015/12/04/json-on-a-diet-how-to-shrink-your-dtos-part-2-skip-empty-collections/
image: /wp-content/uploads/2015/12/post-2015-12-04-thumbnail.png
categories:
  - C#
tags:
  - ASP.NET
  - Collections
  - DefaultValue
  - JSON
  - JSON.NET
  - Mobile App Service
  - Web API
series: JSON on a diet
---

This is the second part in a series of posts about reducing the amount of data transferred between ASP.NET Web API or Azure Mobile App Service and the (mobile) client.

We will continue where we left off in [Part 1: Default Value Handling](/2015/11/06/json-on-a-diet-how-to-shrink-your-dtos-part-1-default-value-handling).

In the first post we managed a reduction of 41%.

Of course, the reduction depends heavily on how often default values are part of your transferred data.
But it's an easy diet on transferred data that the other side can reconstruct on itself.

In this post we will squeeze a little bit more from our Data Transfer Objects (DTOs).

<!--more-->

## Part 2: Skip empty collections

First, we look at the response we got from the second controller:

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

We see that the property `SomeEmptyObjects` is present in the message, despite being an empty collection.
So, this is the next target for elimination.

## Removing the empty collection

The reason the collection is present in the message is because a value of `null` is of course different than an empty array.
But this post is about eliminating data on transport so we start with removing empty collections from our messages.

I was not the first one with this question, and at StackOverflow I found [an answer by Athari](https://stackoverflow.com/questions/18471864/how-to-make-json-net-skip-serialization-of-empty-collections/18486790#18486790).

The post contains a custom contract resolver that deals with this situation.

```csharp title="SkipEmptyCollectionsContractResolver.cs"
public class SkipEmptyCollectionsContractResolver : DefaultContractResolver
{
  protected override JsonProperty CreateProperty(
      MemberInfo member, MemberSerialization memberSerialization)
  {
    var property = base.CreateProperty(member, memberSerialization);

    var isDefaultValueIgnored = ((property.DefaultValueHandling ??
        DefaultValueHandling.Ignore) & DefaultValueHandling.Ignore) != 0;

    if (!isDefaultValueIgnored
        || typeof(string).IsAssignableFrom(property.PropertyType)
        || !typeof(IEnumerable).IsAssignableFrom(property.PropertyType))
    {
      return property;
    }

    Predicate<object> newShouldSerialize = obj =>
    {
      var collection = property.ValueProvider.GetValue(obj) as ICollection;
      return collection == null || collection.Count != 0;
    };

    var oldShouldSerialize = property.ShouldSerialize;
    property.ShouldSerialize = oldShouldSerialize != null
        ? o => oldShouldSerialize(o) && newShouldSerialize(o)
        : newShouldSerialize;

    return property;
  }
}
```

I created a third controller with the custom [`ContractResolver`](https://www.newtonsoft.com/json/help/html/P_Newtonsoft_Json_JsonSerializerSettings_ContractResolver.htm).
This controller demonstrates this new behavior.

A `GET` request to `http://reducejsontraffic.azurewebsites.net/api/skipemptycollection` returns:

```json
[
  {
    "SomeUri": "http://reducejsontraffic.azurewebsites.net/api/",
    "TheDate": "2015-11-10T16:35:32.3507203+00:00",
    "AFixedDate": "2015-07-02T13:14:00+00:00",
    "SomeObjects": [
      {
        "ADouble": 0
      },
      {},
      {
        "ADouble": 1.23456789
      }
    ]
  },
  ...
]
```

<small>(Formatted for readability)</small>

Removing the empty collection removes another 6% from our transferred data.
Bringing the total reduction of this example to 47%.

As I wrote before: there is a difference between a value of `null` and an empty array.
The trade-off is that by removing the information from the DTO the client doesn't know if there was an empty collection or nothing at all.
If this is fine for your code you're done for now.

## Reviving empty collections on the receiving side

In the previous blog post I used the `DefaultAttribute` to declare these defaults on simple types:

```csharp title="Message.cs" showlinenumbers startlinenumber=19
[DefaultValue(14)]
public int Fourteen { get; set; }
```

When the client uses the `Populate` (or `IgnoreAndPopulate`) as `DefaultValueHandling` the property `Fourteen` will get the value of `14` then it's not present in the data.

This also works for the `AStringArray` property which is an array of `String`.

```csharp title="Message.cs" showlinenumbers startlinenumber=24
[DefaultValue(new string[] {})]
public string[] AStringArray { get; set; }
```

However, for the arrays that contain objects you can't declare this as a default.
When you try:

```csharp title="Message.cs"
[DefaultValue(new SomeObject[] { })]
public SomeObject[] SomeEmptyObjects { get; set; }
```

This will give the following error:

> "CS0182: An attribute argument must be a constant expression, typeof expression or array creation expression of an attribute parameter type"

We will have to find another way to declare the default value.

### Initialize collections in the constructor

My own preferred way to initialize collections on a POCO is by setting the collection in the constructor.

```csharp title="Message.cs" showlinenumbers startlinenumber=9
public Message()
{
    SomeObjects = new SomeObject[0];
    SomeEmptyObjects = new SomeObject[0];
}
```

This will make sure we always have an empty collection. And if there is data in the message the Serializer will create a filled collection.

There is a caveat though. When there is no data in message and we have a set the DefaultValueHandling to `Populate` the empty collection is overwritten with a value of `null`.
Therefore, we need to override the DefaultValueHandling for collection properties.

```csharp title="Message.cs" showlinenumbers startlinenumber=39
[JsonProperty(DefaultValueHandling = DefaultValueHandling.Include)]
public SomeObject[] SomeEmptyObjects { get; set; }
```

To test this, we launch the demo client app again.

When we look at the watch in the debugger, we see again that all the properties that are not present in the transferred data are populated with either `null` or their correct default value.

![Visual Studio Watch showing a deserialized object with default value handling](/wp-content/uploads/2015/12/visual-studio-watch-default-value-handling-part2.png)

## Conclusion

In this example we managed to get a total reduction of 47% and still have all the data available in the client.

Of course, the reduction still depends heavily on how often default values and empty collections are part of your transferred data. But the diet continues.

## Source code

You can download the updated [Reduce Json Traffic sample project](https://github.com/eNeRGy164/ReduceJsonTraffic) on GitHub.

You can also go to [the specific commit](https://github.com/eNeRGy164/ReduceJsonTraffic/commit/a4c639a234236ac78af5a1110d240d5ee06ac105) to see the exact changes.
