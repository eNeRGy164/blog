---
id: 1432
title: Using URI’s in YAML with YamlDotNet
date: 2020-06-01T07:00:00+02:00
updated: 2020-07-27T15:04:01+02:00
author: Michaël Hompus
excerpt: >
  Recently, I was using a YAML file for storing some data for a pet project.
  To work with this YAML in a .NET application,
  I use the excellent YamlDotNet library by Antoine Aubry.

  One of my properties was a URL. Deserializing went fine,
  but when serializing back to a YAML file, things were not going as intended.

  In this short article, I will explain how I did fix this.
layout: ../layouts/BlogPost.astro
permalink: /2020/06/01/using-uris-in-yaml-with-yamldotnet/
image: /wp-content/uploads/2020/05/post-1432-thumbnail.png
categories:
  - C#
tags:
  - CSharp
  - dotnet
  - URI
  - YAML
  - YamlDotNet
---

Recently, I was using a [YAML](https://yaml.org/) file for storing some data for a pet project.
To work with this YAML in a .NET application,
I use the excellent [YamlDotNet library](https://github.com/aaubry/YamlDotNet/) by Antoine Aubry.

One of my properties was a URL. Deserializing went fine, but when serializing back to a YAML file, things were not going as intended.

In this short article, I will explain how I did fix this.

## The setup

I have a quite simple piece of YAML describing a website with a name and URL.

```yaml
website:
  name: Blog
  url: https://blog.hompus.nl
```

To represent this in my application, I created a simple POCO.

```csharp
public class Website {
    public string Name { get; set; }

    public Uri Url { get; set; }
}
```

## Deserializing

When deserializing the file, this works completely as expected.
As you can see in the VSCode debugger:

![Deserialized data, as shown in the VSCode debugger](/wp-content/uploads/2020/05/yaml-data-showing-in-debugger.png)

## Serializing

Now I want to serialize the object back to YAML.
However, it ends up looking quite different than before.

```yaml
website:
  name: Blog
  url: &o0
    absolutePath: /
    absoluteUri: *o0
    localPath: /
    authority: blog.hompus.nl
    hostNameType: Dns
    isDefaultPort: true
    pathAndQuery: /
    segments:
      - /
    host: blog.hompus.nl
    port: 443
    query: ""
    fragment: ""
    scheme: https
    originalString: https://blog.hompus.nl
    dnsSafeHost: blog.hompus.nl
    idnHost: blog.hompus.nl
    isAbsoluteUri: true
    userInfo: ""
```

This was not what I expected.

So how can we encourage YamlDotNet to store the property as a string?

## YamlMember

The `YamlMember` attribute can solve this problem.
It has the `SerializeAs` property that allows to set the Type that the serialize must use during serialization.

For this situation, I choose the `String` type.

```csharp
public class Website {
    public string Name { get; set; }

    [YamlMember(typeof(string))]
    public Uri Url { get; set; }
}
```

And when generated the YAML file again, it looks like how I intended it.

```yaml
website:
  name: Blog
  url: https://blog.hompus.nl/
```
