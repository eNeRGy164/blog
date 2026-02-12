---
id: 1245
title: "Bing for business – Part 2: People search"
date: 2017-09-28T00:49:13+02:00
updated: 2020-12-07T17:41:02+01:00
author: Michaël Hompus
excerpt: >
  This will be my second post about Bing for business:
  “the new intelligent search experience for Office 365 and Microsoft 365,
  which uses AI and the Microsoft Graph to deliver more relevant search results based on your organizational context”.

  In this post, we will be focusing on “People Search”.
permalink: /2017/09/28/bing-for-business-part-2-people-search/
image: /wp-content/uploads/2017/09/post-2017-09-28-thumbnail.png
categories:
  - Office
tags:
  - Bing
  - Bing for business
  - Office 365
  - Preview
  - Search
series: Bing for business
---

This will be my second post about
[Bing for business](https://blogs.bing.com/search/2017-09/finding-what-you-need-at-work-just-got-easier-with-bing-for-business),
"the new intelligent search experience for Office 365 and Microsoft 365,
which uses AI and the Microsoft Graph to deliver more relevant search results based on your organizational context".

We covered [branding](/2017/09/25/bing-for-business-part-1-branding) in the first article.
In this article, I will be focusing on _People Search_.

<!--more-->

## Welcome bar

When a user is logged in, Bing will show a welcome bar with some suggestions for queries.

![Welcome bar](/wp-content/uploads/2017/09/bingforbusiness-welcome-bar.png)

Let’s use the first query: _me_.

## Searching for _me_

When searching for _me_, besides all normal Bing search results, you will get your own profile.

![Searching for me](/wp-content/uploads/2017/09/bingforbusiness-people-me.png)

As we can see, the person result page is structured in 3 columns.

### Left column, profile

In the left column, the Azure AD profile information is shown.

- My picture
- My full name
- My function title
- My phone number
- My e-mail address
- My Skype for business alias

### Center column, organization

In the center column, the organizational position is shown.

- My manager
- My peers (sharing the same manager)  
  _When hovering over a profile image, the name and function are shown_
- My department

### Right column, events

In the right column, data from the agenda is shown.

- My timeline for today
- My first 2 upcoming events, with the title, time and location

In total, this gives a good overview of my contact details,
position in the organization and my schedule.

## Searching for _sander_

Chances are that you won’t be searching for your own profile very often.  
So, let’s start looking for the profile of a colleague.
For this I entered _sander_ as search query in Bing.

Although there are multiple colleagues working at Winvision with a first name of _Sander_,
the person that is displayed is the one closest in the organizational structure to me.

![People manager](/wp-content/uploads/2017/09/bingforbusiness-people-manager.png)

The contact details are now an ideal way to start a call or chat with your colleague.
Or you can send an email, if you prefer that as form of communication.

The agenda now does not show the first two events of the person you are looking at,
but the first two events where you are both part of!
This is where the use of the Graph API really starts to shine.

## The other _sander_'s

As mentioned before, there are multiple colleagues with the first name of _Sander_.
This is also indicated at the bottom of the profile, where the first alternative is displayed.

![Other Sander](/wp-content/uploads/2017/09/bingforbusiness-people-more.png)

We can now directly navigate to Sander Hoek's profile if we want,
or we can open a list of all people matching the query:

![More Sander's](/wp-content/uploads/2017/09/bingforbusiness-people-sanders.png)

This concludes this post about the people search in Bing for business.
The things shown in this post might change in the future, as the product is still under development.

If you are interested, visit <https://www.bing.com/Business/explore>.
