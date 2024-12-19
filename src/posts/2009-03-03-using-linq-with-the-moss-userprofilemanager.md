---
id: 14
title: Using LINQ with the MOSS UserProfileManager
date: 2009-03-03T21:40:17+01:00
updated: 2020-12-02T22:44:08+01:00
author: Michaël Hompus
excerpt: >
  Lately I am working a lot with LINQ and al types like LINQ to XML, LINQ to XSD, LINQ to objects, etc.
  Today I had to build some functionality in SharePoint where I had to split users in 2 groups based on a profile property in their User Profile.
  In this post I will show you how I did this.
layout: ../layouts/BlogPost.astro
permalink: /2009/03/03/using-linq-with-the-moss-userprofilemanager/
image: /wp-content/uploads/2009/03/post-14-thumnail-1.png
categories:
  - C#
  - SharePoint
tags:
  - LINQ
  - ProfileManager
  - SharePoint 2007
  - User Profile
---

Lately I am working a lot with LINQ and all flavors like LINQ to XML, LINQ to XSD, LINQ to objects, etc.  
Today I had to build some functionality in SharePoint where I had to split users in two groups based on a profile property in their User Profile.

In this article I will show you how I did this.

<!--more-->

The users I have to query are stored in a `DataView` (represented by the variable `webUsers`) so that is my starting point.
First, I have to create an instance of the [`UserProfileManager` class][USER_PROFILE_MANAGER_CLASS].
This is the connection with the User Profile Database.

Then I iterate the `DataView` and `Cast` every item to the `row` variable.
In the `DataRowView` the `AccountName` column contains a `domain\user` value.
Because it is an `object` and I need it multiple times I store it in a locale variable using the `let` keyword so I only have to cast it one time.

One of the great things is that you are allowed to combine multiple `let`'s and `where` statements. So, every `AccountName` that is `null` or `empty` will be filtered out.

If I would use the [`GetUserProfile` method][GET_USER_PROFILE_METHOD] and pass an account which is not (yet) present in the profile database,
this would result in an exception.
That is why I first use a `where` query in combination with the [`UserExists` method][USER_EXISTS_METHOD].

For readability, I use another `let` to store the value I need in the comparison.
Now I can create an anonymous object with a `boolean` if the title was equal to `student`, and some other profile properties.

```csharp
var profileManager = new UserProfileManager();
var users = (from DataRowView row in webUsers
             let accountName = (string)row["AccountName"]
             where !string.IsNullOrEmpty(accountName)
             where profileManager.UserExists(accountName)
             let userProfile = profileManager.GetUserProfile(accountName)
             let title = (userProfile["Title"] != null)
                ? (string)userProfile["Title"].Value
                : string.Empty
             select new
             {
                IsStudent = title == "student",
                Initials = (userProfile["Initials"] != null)
                  ? (string)userProfile["Initials"].Value
                  : string.Empty,
                LastName = (userProfile["LastName"] != null)
                  ? (string)userProfile["LastName"].Value
                  : string.Empty,
             }).AsEnumerable();


var employees = from employee in users
                where !employee.IsStudent
                select employee;

var students = from student in users
               where student.IsStudent
               select student;
```

Now, I can easily get all students and employees in different collections based on that boolean property.
And never call the ProfileManager more than necessary.

[USER_PROFILE_MANAGER_CLASS]: https://learn.microsoft.com/previous-versions/office/developer/sharepoint-2007/ms499834(v=office.12)
[GET_USER_PROFILE_METHOD]: https://learn.microsoft.com/previous-versions/office/developer/sharepoint-2007/ms562764(v=office.12)
[USER_EXISTS_METHOD]: https://learn.microsoft.com/previous-versions/office/developer/sharepoint-2007/ms517538(v=office.12)
