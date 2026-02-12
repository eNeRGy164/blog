---
id: 255
title: Provisioning a default layout and content when adding a wiki page
date: 2012-06-07T15:07:58+02:00
updated: 2020-12-06T18:12:52+01:00
author: Michaël Hompus
excerpt: >
  Recently I was challenged with the task to set the layout and content of a wiki page when a new page is added to a team site.
  As I'm used to work with SharePoint publishing the task sounded easy, but I was wrong.
permalink: /2012/06/07/provisioning-a-default-layout-and-content-when-adding-a-wiki-page/
image: /wp-content/uploads/2012/06/post-2012-06-07-thumbnail.png
categories:
  - SharePoint
tags:
  - Events
  - SharePoint 2010
  - SharePoint Foundation
  - Wiki
---

Recently I was challenged with the task to set the layout and content of a wiki page when a new page is added to a team site.
As I am used to work with SharePoint publishing, the task sounded easy, but I was wrong.

## Text Layout

![Image showing the Text Layout option in the SharePoint ribbon](/wp-content/uploads/2012/06/sharepoint-text-layout-ribbon.png)

My first path was to figure out where SharePoint puts the wiki "text layouts".
I discovered this is not how it works. The layouts available for wiki's are not configurable anywhere.

But using some PowerShell it was easy to get and set the layout as it is the HTML content of the "Wiki Field" column in the list.

```powershell
$web = Get-SPWeb http://server/teamsite
$list = $web.Lists["Site Pages"]
$listItem = $list.Items[2] # My test page
$listItem["Wiki Content"] # Returns HTML
```

The HTML content consists of two parts.
The layout table and the layout data.

```html
<table id="layoutsTable" style="width: 100%">
  <tbody>
    <tr style="vertical-align: top">
      <td style="width: 100%">
        <div class="ms-rte-layoutszone-outer" style="width: 100%">
          <div class="ms-rte-layoutszone-inner"></div>
        </div>
      </td>
    </tr>
  </tbody>
</table>
<span id="layoutsData" style="display: none">false,false,1</span>
```

The layout data describes visibility of the header and footer and the number of columns.

## Event receiver

To set the content the first thing in my mind was to add an
[`ItemAdding` event receiver](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms414997(v=office.15)>),
associated with `ListTemplateId 119` (WebPageLibrary).

I deployed the solution and added a page and 🎉: no content!

Using the debugger to verify my event receiver was triggered, I went to the next option:
adding an [`ItemAdded` event receiver](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms461317(v=office.15)>).
This time I got an exception the page was already modified by another user.
Refreshing the page gave me the default content.

So, this told me 2 things:

1. It is possible to set default content
2. I forgot to set the `Synchronize` property

So, after fixing the second thing, I deployed once again and got: no content!

As I used [`ListItem.Update` method](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms431008(v=office.15)>) in my receiver,
I got a version history where it showed the content was set, but the final version still ended up empty.

When faced with utter desperation, working with SharePoint has taught me you always have an escape:
launch [Reflector](https://www.red-gate.com/products/reflector/).

There I found this gem of code in the `SubmitBtn_Click` method of the `CreateWebPage Class`:

```csharp
SPFile file = SPUtility.CreateNewWikiPage(wikiList, serverRelativeUrl);
SPListItem item = file.Item;
item["WikiField"] = "";
item.UpdateOverwriteVersion();
```

So, no matter what I do in `ItemAdding` or `ItemAdded`, the content always ends up empty!

After this discovery, the fix was removing the code from the `ItemAdding` and `ItemAdded` events and moving it to the
[`ItemUpdated` method](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms456015(v=office.15)>)
(synchronous) and added a check if the WikiField content is an empty string.

```csharp
public override void ItemUpdated(SPItemEventProperties properties)
{
    base.ItemUpdated(properties);

    var listItem = properties.ListItem;

    if (!string.IsNullOrEmpty(listItem["WikiField"] as string))
    {
        return;
    }

    this.EventFiringEnabled = false;

    listItem["WikiField"] = html;
    listItem.UpdateOverwriteVersion();

    this.EventFiringEnabled = true;
}
```

Now every wiki page I add to the team site contains the correct text layout and contains the default HTML.
