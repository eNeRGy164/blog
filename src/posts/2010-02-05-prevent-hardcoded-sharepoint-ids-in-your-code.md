---
id: 100
title: Prevent hardcoded SharePoint IDs in your code
date: 2010-02-05T12:44:39+01:00
updated: 2020-12-03T23:12:40+01:00
author: Michaël Hompus
excerpt: >
  Now and again I come across code with hardcoded SharePoint IDs in it. Or scary loops matching a field, list or property name.
  SharePoint provides some classes containing the out of the box IDs, you only have to know they exist.
  I made an overview so nobody has to hardcode those pesky GUIDs, ContentTypeId's or property names.
layout: ../layouts/BlogPost.astro
permalink: /2010/02/05/prevent-hardcoded-sharepoint-ids-in-your-code/
image: /wp-content/uploads/2010/02/post-100-thumnail-1.png
categories:
  - SharePoint
tags:
  - ContentType
  - Feature
  - Field
  - Publishing
  - SharePoint 2007
  - SharePoint 2010
  - SharePoint 2013
  - User Profile
  - WSS 3.0
---

Now and again I come across code with hardcoded SharePoint IDs in it.
Or scary loops matching a field, list or property name.  
SharePoint provides some classes containing the out of the box IDs, you only have to know they exist.  
I made an overview so nobody has to hardcode those pesky GUIDs, ContentTypeIds or property names any longer.

<!--more-->

## WSS/Core - Microsoft.SharePoint.SPBuiltInFieldId

The [`SPBuiltInFieldId` class][SP_BUILT_IN_FIELD_ID_CLASS] contains 314 GUIDs for the default SharePoint fields.
You can find them all on the [`SPBuiltInFieldId` fields][SP_BUILT_IN_FIELD_ID_FIELDS] page, but I name some of the more common ones:

* `Created`
* `Created_x0020_By`
* `ID`
* `Modified`
* `Modified_x0020_By`
* `Title`
* `UniqueId`

## WSS/Core - Microsoft.SharePoint.SPBuiltInContentTypeId

The [`SPBuiltInContentTypeId` class][SP_BUILT_IN_CONTENT_TYPE_ID_CLASS] contains 34 content type IDs for the default SharePoint content types.
You can find them all on the [`SPBuiltInContentTypeId` fields][SP_BUILT_IN_CONTENT_TYPE_ID_FIELDS] page, but I name some of the more common ones:

* `Announcement`
* `Document`
* `Folder`
* `Item`
* `Task`

## WSS/Core - Microsoft.SharePoint.SPListTemplateType

The [`SPListTemplateType` enumeration][SP_LIST_TEMPLATE_TYPE_ENUMERATION]
is more commonly known and used but what's more special about this enumeration is to use it in combination with the
[`SPSite.GetCatalog` method][GET_CATALOG_METHOD].

With this method you can easily retrieve the `MasterPageCatalog` for the current site collection:

```csharp
var site = SPContext.Current.Site;
var masterPageGallery = 
    site.GetCatalog(SPListTemplateType.MasterPageCatalog) as SPDocumentLibrary;

if (masterPageGallery != null)
{
    // DoStuff()
}
```

The enumerations contain four list template IDs for the default SharePoint catalogs.

* `ListTemplateCatalog`
* `MasterPageCatalog`
* `WebPartCatalog`
* `WebTemplateCatalog`

## MOSS - Microsoft.SharePoint.Publishing.FeatureIds

The [`FeatureIds` class][FEATURE_IDS_CLASS] contains 16 GUIDs for the MOSS publishing features.
You can find them all on the [`FeatureIds` fields][FEATURE_IDS_FIELDS] page,
but I name the most common ones:

* `Navigation`
* `Publishing`

## Server - Microsoft.SharePoint.Publishing.Internal.WssFeatureIds

This class is not documented and the namespace implies its internal.
The `WssFeatureIds` class however is public and the only place the 24 WSS feature IDs are available.

Because this class is not documented I list all fields:

* `AnnouncementsList`
* `BasicWebParts`
* `ContactsList`
* `CustomList`
* `DataConnectionLibrary`
* `DataSourceLibrary`
* `DiscussionsList`
* `DocumentLibrary`
* `EventsList`
* `GanttTasksList`
* `GlobalContentTypes`
* `GlobalFields`
* `GlobalMobilityRedirect`
* `GridList`
* `IssuesList`
* `LinksList`
* `NoCodeWorkflowLibrary`
* `PictureLibrary`
* `SurveysList`
* `TasksList`
* `TeamCollaboration`
* `WebPageLibrary`
* `WorkflowHistoryList`
* `XmlFormLibrary`

## Server - Microsoft.SharePoint.Publishing.FieldId

The [`FieldId` class][FIELD_ID_CLASS] contains 61 GUIDs for the publishing fields.
You can find them all on the [`FieldId` properties][FIELD_ID_PROPERTIES] page,
but I name some of the more common ones:

* `Contact`
* `PageLayout`
* `PreviewImage`
* `PublishingPageContent`
* `PublishingPageImage`
* `RollupImage`

## Server - Microsoft.SharePoint.Publishing.ContentTypeId

The [`ContentTypeId` class][CONTENT_TYPE_ID_CLASS] contains 10 content type IDs for the publishing content types.
You can find them all on the [`ContentTypeId` properties][CONTENT_TYPE_ID_PROPERTIES] page,
but I name some of the more common ones:

* `ArticlePage`
* `MasterPage`
* `PageLayout`
* `WelcomePage`

## MOSS - Microsoft.Office.Server.UserProfiles.PropertyConstants

The [`PropertyConstants` class][PROPERTY_CONSTANTS_CLASS] contains 42 names of the standard user profile properties.
You can find them all on the [`PropertyConstants` fields][PROPERTY_CONSTANTS_FIELDS] page,
but I name some of the more common ones:

* `BirthDay`
* `CellPhone`
* `Department`
* `FirstName`
* `LastName`
* `Manager`
* `PictureUrl`
* `PreferredName`
* `Title`
* `WorkEmail`
* `WorkPhone`

[SP_BUILT_IN_FIELD_ID_CLASS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms435407(v=office.15)
[SP_BUILT_IN_FIELD_ID_FIELDS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms439470(v=office.15)
[SP_BUILT_IN_CONTENT_TYPE_ID_CLASS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms461338(v=office.15)
[SP_BUILT_IN_CONTENT_TYPE_ID_FIELDS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms434482(v=office.15)
[SP_LIST_TEMPLATE_TYPE_ENUMERATION]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms413878(v=office.15)
[GET_CATALOG_METHOD]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms480807(v=office.15)
[FEATURE_IDS_CLASS]: https://learn.microsoft.comprevious-versions/office/sharepoint-server/ms583113(v=office.15)
[FEATURE_IDS_FIELDS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms559490(v=office.15)
[FIELD_ID_CLASS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms498502(v=office.15)
[FIELD_ID_PROPERTIES]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms552092(v=office.15)
[CONTENT_TYPE_ID_CLASS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms584122(v=office.15)
[CONTENT_TYPE_ID_PROPERTIES]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms500588(v=office.15)
[PROPERTY_CONSTANTS_CLASS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms564607(v=office.15)
[PROPERTY_CONSTANTS_FIELDS]: https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms549392(v=office.15)
