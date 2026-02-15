---
id: 895
title: "Introducing Sandboxable: use your favorite (Azure) NuGet packages in a sandbox environment"
date: 2016-07-13T16:08:37+02:00
updated: 2021-07-16T22:48:10+02:00
author: Michaël Hompus
excerpt: >
  I would like to introduce to you Winvision’s first open source project: Sandboxable.

  Sandboxable enables your project to utilize functionality provided by other (Microsoft) libraries that normally are not available in a Partial Trust environment like the Microsoft Dynamics CRM sandbox process.

  The project offers modified NuGet packages that will run with Partial Trust.
permalink: /2016/07/13/introducing-sandboxable-use-your-favorite-azure-nuget-packages-in-a-sandbox-environment/
image: /wp-content/uploads/2016/07/post-2016-07-13-thumbnail.png
categories:
  - Azure
  - C#
  - Dynamics CRM
tags:
  - Azure
  - CRM
  - NuGet
  - Open Source
  - Plugin
  - SDK
thumbnail:
  title: "Introducing Sandboxable for Azure NuGet"
  subtitle: >
    Open-source project enabling Azure NuGet packages to run in Dynamics CRM partial trust sandboxes.
---

I would like to introduce to you Winvision's first open-source project: [Sandboxable](https://github.com/Winvision/Sandboxable).

Sandboxable enables your project to utilize functionality provided by other (Microsoft) libraries that normally are not able to use in a Partial Trust environment like the Microsoft Dynamics CRM sandbox process.  
The project offers modified NuGet packages that will run with Partial Trust.

<!--more-->

## Sandboxing

Sandboxing is the practice of running code in a restricted security environment, which limits the access permissions granted to the code.
For example, if you have a managed library from a source you do not trust, you should not run it as fully trusted.
Instead, you should place the code in a sandbox that limits its permissions to those that you expect it to need.

You can read more on this in the article [How to: Run Partially Trusted Code in a Sandbox](https://learn.microsoft.com/revious-versions/dotnet/framework/code-access-security/how-to-run-partially-trusted-code-in-a-sandbox)
If you encounter a .NET sandbox today chances are it's running with [Security-Transparent Code, Level 2](https://learn.microsoft.com/previous-versions/dotnet/framework/code-access-security/security-transparent-code-level-2)

A big example of software running in a sandbox are the Microsoft Dynamics CRM (Online) Plug-ins and custom workflow activities.
([Plug-in Trusts](<https://learn.microsoft.com/previous-versions/dynamicscrm-2016/developers-guide/gg334752(v=crm.8)>))

## The problem

As developers we use a lot of library code like NuGet packages as we are not trying to reinvent the wheel. The downside is that most of these libraries are not written with a Partial Trust environment in mind.

When we embed these libraries to our code in the sandbox, we encounter two common issues:

1. The code contains security critical code and will fail to load with a `TypeLoadException` or will throw an `SecurityException` at runtime
2. The package references another package that contains security critical code and even though the code might not even be used it will trigger one of the exceptions mentioned above

## Problematic constructs

### Calling native code

```csharp
[DllImport("advapi32.dll", SetLastError = true)]
[return: MarshalAs(UnmanagedType.Bool)]
internal static extern bool CryptDestroyHash(IntPtr hashHandle);
```

### Override `SecurityCritical` properties of an object like `Exception`

```csharp
public override void GetObjectData(SerializationInfo info, StreamingContext context)
{
  ...
}
```

Where `Exception` has the following attributes on this method

```csharp
[System.Security.SecurityCritical]
public virtual void GetObjectData(SerializationInfo info, StreamingContext context)
{
  ...
}
```

### Serialize non-public classes, fields or properties

```csharp
[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, NullValueHandling = NullValueHandling.Ignore, PropertyName = PropertyNotBefore, Required = Required.Default)]
private long? _notBeforeUnixTime { get; set; }
```

## The solution

When we encounter a NuGet package that fails to load or execute in the sandbox and its source is available we make a _Sandboxable_ copy of it.

This is done by eliminating the offending code in a way that is the least obtrusive and publish this version to NuGet.

The base rules are:

- Keep the code changes as small as possible
- Prefix all namespaces with Sandboxable
- Eliminate offending NuGet dependencies
- If a new dependency is needed, it will be on a sandbox friendly NuGet package

## Source and contribution

The source is published at the [Sandboxable project at GitHub](https://github.com/Winvision/Sandboxable).

Included in the solution is also a stand-alone project to test if code will break inside a sandbox.
This makes testing libraries easier without the need to deploy it to a (remote) environment.

I like to invite everybody to use the [Sandboxable NuGet packages](https://www.nuget.org/packages?q=sandboxable) and contribute to the project.
