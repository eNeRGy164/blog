---
id: 84
title: MySitePublicWebPartPage throws NullReferenceException with August Cumulative Update
date: 2010-01-15T13:27:31+01:00
updated: 2020-12-03T22:54:59+01:00
author: Michaël Hompus
excerpt: >
  With the introduction of the August Cumulative Update for SharePoint 2007 (KB973399) we encountered
  “System.NullReferenceException: Object reference not set to an instance of an object.”
  on all pages inheriting from MySitePublicWebPartPage.
permalink: /2010/01/15/mysitepublicwebpartpage-throws-nullreferenceexception-with-august-cumulative-update/
image: /wp-content/uploads/2010/01/post-2010-01-15-thumbnail.png
categories:
  - SharePoint
tags:
  - CU
  - Exception
  - MySite
  - ProfilePropertyImage
  - SharePoint 2007
thumbnail:
  title: "MySite NullReferenceException After CU"
  subtitle: >
    The August 2009 Cumulative Update for SharePoint 2007 breaks pages inheriting from MySitePublicWebPartPage.
---

## The problem

With the introduction of the **August Cumulative Update for SharePoint 2007** (KB973399) we encountered
`System.NullReferenceException: Object reference not set to an instance of an object.` on all pages
inheriting from [`MySitePublicWebPartPage`][MY_SITE_PUBLIC_WEB_PART_PAGE_CONTROL].

<!--more-->

![Stack Trace of the exception](/wp-content/uploads/2010/01/stacktrace-of-exception.png "Stack Trace of the exception")

As can be seen in the stack trace the error occurs from a call by the [`ProfilePropertyImage` control][PROFILE_PROPERTY_IMAGE_CONTROL],
which is on the page by default.

## The cause

This call was not present in the control prior to the august update, so let’s take a look at the **description of the update** (KB973409).

> A Shared Services Provider administrator edits the **About me** property or the **Picture** property to make the property display "Only me".
> However, these properties continue to be visible when the profile owner sets their **As Seen By** option to "Everyone", "My Colleagues",
> "My Workgroup" or "My Manager" on their own Person.aspx page.

So, this explains why the control was changed, it now looks if the image should be rendered for the current visitor of the page.

## The reason

We already know the problem starts inside the ProfilePropertyImage which is calling the
[`MySitePublicWebPartPage.GetEffectivePrivacy` method][GET_EFFECTIVE_PRIVACY_METHOD].
This method reads the value of the [`MySitePublicWebPartPage.PrivacySelected` property][PRIVACY_SELECTED_PROPERTY].
Inside the getter of the property the following code is used:

```csharp
object obj2 = this.ViewState["__PrivacySelected__"];
return (Privacy) obj2;
```

As we all know SharePoint's code is never about defensive programming and so is the case here if there is no `ViewState` Property available,
it will return a `null`.
And of course, there is no check anywhere for that.

But this code works for the default `person.aspx` page, so the setter for this property has to be called somewhere.
Analysis of the code shows only the [`AsSeenBy` class][AS_SEEN_BY_CLASS] ever calls the setter.
As this control is on the `person.aspx` page by default, the property is set and that page works fine.
As we do not have this control on our page, we get a `NullReferenceException`.

## The solution

If you are bound to the August release the solution is simple: add the `AsSeenBy` control to your page.

But what if you do not want to have the control on your page?
We get lucky, because if you do not make it visible it will still work, so add:

```xml
<SPSWC:AsSeenBy runat="server" id="ddlAsSeenBy" SelectionMode="Single"
                autopostback="True" Visible="False" />
```

If you are not bound to the August upgrade you can upgrade to the **October Cumulative Update** or newer.
Microsoft has fixed the issue in those versions.

[MY_SITE_PUBLIC_WEB_PART_PAGE_CONTROL]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms547244(v=office.15)
[PROFILE_PROPERTY_IMAGE_CONTROL]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms565011(v=office.15)
[GET_EFFECTIVE_PRIVACY_METHOD]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms499526(v=office.15)
[PRIVACY_SELECTED_PROPERTY]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms549073(v=office.15)
[AS_SEEN_BY_CLASS]: https://learn.microsoft.com/previous-versions/office/developer/sharepoint-2007/aa594189(v=office.12)
