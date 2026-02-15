---
id: 481
title: Get the Entity Type Code using JavaScript only (not using remote services)
date: 2015-05-28T09:12:15+02:00
updated: 2020-12-06T19:11:57+01:00
author: Michaël Hompus
excerpt: >
  Every Microsoft Dynamics CRM developer has faced this problem: How to get the entity type code for your custom entity in JavaScript.
  If you need the entity type code for the current form there are several supported ways to get it.
  But when you want the entity type code for a different custom entity, you are in trouble.
  The SDK has no real solution for this, and hard-coding is no option as the numbers can change per deployment.

  Digging through the client side object model I found a nice, although still unsupported, treasure which works with CRM 2011 and up, including the latest installment: 2015 update 1.
permalink: /2015/05/28/entity-type-code-using-javascript-only/
image: /wp-content/uploads/2015/05/post-2015-05-28-thumbnail.png
categories:
  - Dynamics CRM
tags:
  - CRM
  - Dynamics
  - Entity Type Code
  - Entity Type Name
  - JavaScript
thumbnail:
  title: "Entity Type Code via JavaScript in Dynamics CRM"
  subtitle: >
    A client-side approach to retrieve custom entity type codes in Dynamics CRM without remote service calls.
---

Every Microsoft Dynamics CRM developer has faced this problem:
How to get the entity type code for your custom entity in JavaScript.
If you need the entity type code for the current form there are several supported ways to get it.
But when you want the entity type code for a different custom entity, you are in trouble.

The SDK has no real solution for this,
and hard-coding is no option as the numbers can change per deployment.

<!--more-->

So how do most people solve this?
A popular choice is the unsupported "Remote Command and Lookup service".  
Because of the asynchronous nature the use of a service adds a performance penalty and complexity to your code.
It also seems this will [break in CRM 2015 Update 1](https://community.dynamics.com/forums/thread/details/?threadid=7fe08fe0-0c1c-48cc-9911-0d9f23a24bc5).

Digging through the client-side object model I found a nice, although still unsupported,
treasure which works with CRM 2011 and up, including the latest installment: 2015 update 1.

```js
Mscrm.EntityPropUtil.EntityTypeName2CodeMap;
```

This class contains a dictionary of all out-of-the-box entities but also all custom entities.
And as it's already loaded in memory there is no performance loss.

## Form JavaScript

When using JavaScript in a form the goodies are readily available:

```js
Mscrm.EntityPropUtil.EntityTypeName2CodeMap.account;
// 1

Mscrm.EntityPropUtil.EntityTypeName2CodeMap["account"];
// 1

Mscrm.EntityPropUtil.EntityTypeName2CodeMap.wv_country;
// 10025
```

## Web Resource

From a web resource just target the parent `window`:

```js
window.parent.Mscrm.EntityPropUtil.EntityTypeName2CodeMap;
```

Or, if you have included the `ClientGlobalContext.js.aspx`,
you can also use the class directly:

```js
Mscrm.EntityPropUtil.EntityTypeName2CodeMap;
```

## Turbo Forms

With the introduction of the turbo forms in CRM 2015 update 1 you need an additional line of code to make the mapping work:

```js
if (Mscrm.EntityPropUtil == null) {
  Mscrm.EntityPropUtil = parent.Mscrm.EntityPropUtil;
}
```

## From entity type code to entity type name

If you want to use this map to get the entity type name from the entity type code you can use the following line of JavaScript:

```js
Object.keys(Mscrm.EntityPropUtil.EntityTypeName2CodeMap).filter(function (key) {
  return Mscrm.EntityPropUtil.EntityTypeName2CodeMap[key] === 10025;
})[0];
// "wv_country"
```

It is that easy!
