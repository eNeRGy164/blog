---
id: 1580
title: YAML properties as Scalar or Sequence? Or both?!
date: 2020-08-17T14:51:34+02:00
updated: 2021-07-16T22:38:54+02:00
author: Michaël Hompus
excerpt: >
  YAML is a data serialization standard that is intended to be human friendly.
  For example, it reduces the use of delimiters quite drastically compared to other formats like JSON.

  Some YAML file authors might push the boundary for readability even further by having a
  property where the value can be a sequence with zero or more values,
  or just a scalar if there is only a single value.
  Reducing the number of delimiters someone has to read or write even further.

  How can this work with C#, a strongly typed language?
permalink: /2020/08/17/yaml-properties-as-scalar-or-sequence-or-both/
image: /wp-content/uploads/2020/08/post-2020-08-17-thumbnail.png
categories:
  - C#
tags:
  - CSharp
  - YAML
  - YamlDotNet
thumbnail:
  title: "YAML: Scalar or Sequence? Or Both?!"
  subtitle: >
    Handling YAML properties that accept both single values and lists in C#.
---

[YAML](https://yaml.org/) is a data serialization standard that is intended to be human friendly.
For example, it reduces the use of delimiters quite drastically compared to other formats like JSON.

Some YAML file authors might push the boundary for readability even further by having a property
where the value can be a `sequence` with zero or more values,
or just a `scalar` if there is only a single value.
Reducing the number of delimiters someone must read or write even further.

How can this work with C#, a strongly typed language?

<!--more-->

## A small introduction to YAML data structures

The [YAML standard](https://yaml.org/spec/1.2.2/#chapter-1-introduction-to-yaml) describes three basic primitives for data structures:

- [mappings](https://yaml.org/spec/1.2.2/#mapping) (hashes/dictionaries)
- [sequences](https://yaml.org/spec/1.2.2/#sequence) (arrays/lists)
- [scalars](https://yaml.org/spec/1.2.2/#scalar) (strings/numbers)

In this article, we will focus only on _sequences_ and _scalars_.

### Scalars

To set the value of a property using a scalar, in this case a `string`, you write:

```yaml
dependsOn: previousStage1
```

### Sequences

There are two ways to write a sequence in a YAML file.

In block style, using a _dash_ and _space_ to form a bulleted list,
putting every entry on a separate line:

```yaml
dependsOn:
  - previousStage1
  - previousStage2
```

In flow style, using _square brackets_ as delimiters and a _comma_ as separator:

```yaml
dependsOn: [previousStage1, previousStage2]
```

Both versions are holding the same data and are interchangeable.
It is up to the author which style is preferred, based on readability and context.

## Pushing readability even further

Some YAML file authors might push the boundary for readability even further.
Take for example the [YAML schema for Azure Pipelines](https://learn.microsoft.com/azure/devops/pipelines/yaml-schema/).
If we look at the [Stage](https://learn.microsoft.com/azure/devops/pipelines/yaml-schema/stages-stage) or
[Job](https://learn.microsoft.com/azure/devops/pipelines/yaml-schema/jobs-job) structures,
they both have a `dependsOn` property that can be a `string`, or a `sequence of string`.

```yaml
stages:
- stage: string # Required as first property. ID of the stage.
  displayName: string # Human-readable name for the stage.
  dependsOn: string | [ string ] # Any stages which must complete before this one.
  …

jobs:
- job: string # Required as first property. ID of the job.
  displayName: string # Human-readable name for the job.
  dependsOn: string | [ string ] # Any jobs which must complete before this one.
  …
```

If the author of an Azure pipeline has only a single value for the `dependsOn` property,
they do not need to add all the delimiters to the value.
Stating only the single value as a `string` is good enough.

```yaml
dependsOn: previousStage1

# equals
dependsOn:
- previousStage1

# equals
dependsOn: [ previousStage1 ]
```

## Typed Languages

This is brief, and nice for readability.
But if we want to parse this YAML document in a typed language like C#,
we will get into trouble as there is no datatype that can be a single `string` and a `sequence of` `string` at the same time.

If we create a class that uses a `string` for storing the value,
it will not work if we supply multiple values.
But what if we use an enumerable data type?
It is not a problem if we only store a single value in a list.

So, how can this work?

For the code, the [YamlDotNet library](https://github.com/aaubry/YamlDotNet) is used [again](/2020/06/01/using-uris-in-yaml-with-yamldotnet).

First, add a class to stand for the deserialized data, we will use the Azure pipeline `Stage` as an example.

```csharp
public class Stage
{
  public IEnumerable<string> DependsOn { get; set; }
}
```

Create a deserializer, and feed it the sequence example mentioned earlier.

```csharp
var deserializer = new DeserializerBuilder()
    .WithNamingConvention(CamelCaseNamingConvention.Instance)
    .Build();

var stage = deserializer.Deserialize<Stage>("dependsOn: [ previousStage1, previousStage2 ]");

// stage.DependsOn
// Count = 2
//     [0]: "previousStage1"
//     [1]: "previousStage2"
```

That is nice and easy.  
What happens when we feed it with a single value?

```csharp
var stage = deserializer.Deserialize<Stage>("dependsOn: previousStage1");

// YamlDotNet.Core.YamlException: '(Line: 1, Col: 12, Idx: 11) - (Line: 1, Col: 26, Idx: 25):
// Exception during deserialization
// Inner Exception
// 'InvalidCastException: Invalid cast from 'System.String' to 'System.Collections.Generic.List`1[[System.String, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]'.
```

Okay, we need to help YamlDotNet a bit here, let us add some magic.

## The YAML Type Converter

So, how to convince YamlDotNet that if an `enumerable string` is used as a data type and a single `string` value is stored in the YAML document,
we want to add as the sole value to the list.

For this we add a converter class that inherits from the `IYamlTypeConverter` interface.
Sadly, there is not much documentation about [YAML Type Converters](https://github.com/aaubry/YamlDotNet/wiki/Serialization.TypeConverters),
but in summary, it uses events to read or write to a YAML stream.

Let us implement the interface and state in the `Accepts` method that we can handle `enumerable string` data types.

```csharp
public class ScalarOrSequenceConverter : IYamlTypeConverter
{
  public bool Accepts(Type type)
  {
    return typeof(IEnumerable<string>).IsAssignableFrom(type);
  }

  public object ReadYaml(IParser parser, Type type)
  {
    throw new NotImplementedException();
  }

  public void WriteYaml(IEmitter emitter, object value, Type type)
  {
    throw new NotImplementedException();
  }
}
```

In the `ReadYaml` method we will implement the logic of reading from the YAML stream.

We first try if the current event is a `Scalar` event using the `TryConsume` method,
if that is successful, we return a list with a single entry.

```csharp
public object ReadYaml(IParser parser, Type type)
{
  if (parser.TryConsume<Scalar>(out var scalar))
  {
    return new List<string> { scalar.Value };
  }
}
```

If the source is a sequence, this will be visible by a `SequenceStart` event.  
For every entry we will get a `Scalar` event.  
And when there are no more entries, we handle the `SequenceEnd` event.  
Now, we can return the list with all items.

```csharp
if (parser.TryConsume<SequenceStart>(out var _))
{
  var items = new List<string>();

  while (parser.TryConsume<Scalar>(out var scalarItem))
  {
    items.Add(scalarItem.Value);
  }

  parser.Consume<SequenceEnd>();

  return items;
}
```

If the data was not a scalar or a sequence, we will return an empty list.

```csharp
return Enumerable.Empty<string>();
```

We need to register this converter with the deserializer.

```csharp {2}
var deserializer = new DeserializerBuilder()
    .WithTypeConverter(new ScalarOrSequenceConverter())
    .WithNamingConvention(CamelCaseNamingConvention.Instance)
    .Build();
```

If we run the failed code again, we see it works:

```csharp frame="none"
var stage = deserializer.Deserialize<Stage>("dependsOn: previousStage1");

// stage.DependsOn
// Count = 1
//     [0]: "previousStage1"
```

## Writing YAML

So, with the reading part implemented, could we also mimic the same behavior when writing YAML?

Start with the creation of a `Serializer`.

```csharp
var serializer = new SerializerBuilder()
    .WithNamingConvention(CamelCaseNamingConvention.Instance)
    .Build();
```

Then, create an instance of the `Stage` class and give it a single value. This returns a sequence with a single item, not very surprising.

```csharp
var stage = new Stage { DependsOn = new[] { "previousStage1" } };
serializer.Serialize(Console.Out, stage);

// dependsOn:
// - previousStage1
```

If we want to change the behavior of the serializer, we add the type converter to the configuration.

```csharp {2}
var serializer = new SerializerBuilder()
    .WithTypeConverter(new ScalarOrSequenceConverter())
    .WithNamingConvention(CamelCaseNamingConvention.Instance)
    .Build();
```

Add the logic to the `WriteYaml` method. We cast the object to an enumerable of `string`.  
If it has exactly one item, we emit a Scalar event holding the value.  
Otherwise, we will emit a `SequenceStart` event, a `Scalar` event for every item
in the list and finish with a `SequenceEnd` event to close the sequence.

```csharp
public void WriteYaml(IEmitter emitter, object value, Type type)
{
  var sequence = (IEnumerable<string>)value;
  if (sequence.Count() == 1)
  {
    emitter.Emit(new Scalar(default, sequence.First()));
  }
  else
  {
    emitter.Emit(new SequenceStart(default, default, false, SequenceStyle.Any));

    foreach (var item in sequence)
    {
      emitter.Emit(new Scalar(default, item));
    }

    emitter.Emit(new SequenceEnd());
  }
}
```

If we now repeat the earlier example, we see the output is as expected.

```csharp
var stage = new Stage { DependsOn = new[] { "previousStage1" } };
serializer.Serialize(Console.Out, stage);

// dependsOn: previousStage1
```

And if we have multiple items, it is still written as a sequence.

```csharp
var stage = new Stage { DependsOn = new[] { "previousStage1", "previousStage2" } };
serializer.Serialize(Console.Out, stage);

// dependsOn:
// - previousStage1
// - previousStage2
```

If the list is empty, the sequence will still have a start and end event.  
An empty list is written in flow style.

```csharp
var stage = new Stage { DependsOn = new string[0] };
serializer.Serialize(Console.Out, stage);

// dependsOn: []
```

## Conclusion

It is possible to allow users more flexibility if you expect sequences often to contain a single value.
And this can be done without losing the possibility to use typed languages like C# to parse it.

The code used in this article is [shared on GitHub](https://github.com/eNeRGy164/YamlScalarOrSequence).
