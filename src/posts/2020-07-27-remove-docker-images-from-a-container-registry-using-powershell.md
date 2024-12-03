---
id: 1508
title: Remove docker images from a Container Registry using PowerShell
date: 2020-07-27T14:48:02+02:00
updated: 2024-12-03T20:05:00+01:00
author: Michaël Hompus
excerpt: >
  When using a Docker Registry, like hub.docker.com,
  you will not often want to delete a published version of an image.
  You cannot know if someone,
  somewhere in the world is using that specific version.

  But when using a repository as part of your CI/CD pipeline,
  you might have lots of versions that are not used by anyone anymore.
  So, what if you want to clean the repository automatically?

  In this article, I will show how the delete images by tag,
  using PowerShell and the Docker Registry HTTP API V2.
layout: ../layouts/BlogPost.astro
permalink: /2020/07/27/remove-docker-images-from-a-container-registry-using-powershell/
image: /wp-content/uploads/2020/07/post-1508-thumbnail.png
categories:
  - Azure
  - PowerShell
tags:
  - Azure
  - Container Registry
  - PowerShell
---

When using a Docker Registry, like [hub.docker.com](https://hub.docker.com/),
you will not often want to delete a published version of an image.
You cannot know if someone, somewhere in the world is using that specific version.

But when using a repository as part of your CI/CD pipeline,
you might have lots of versions that are not used by anyone anymore.
So, what if you want to clean the repository automatically?

In this article, I will show how the delete images by tag,
using PowerShell and [the CNCF Distribution HTTP API V2](https://distribution.github.io/distribution/spec/api/).
This API is implemented by registries, like the [Azure Container Registry](https://azure.microsoft.com/products/container-registry/) service.

<!--more-->

---

In the examples, we will have two variables, `Credentials` and `Name`.

- `$Credentials` is the username and password to authenticate to the repository.
- `$Name` is the name of the image, like `ubuntu` or `energy164/gw2pvo`, without the tag part.

## Get all image tags

First, retrieving all the existing tags for the image.

As the [`tags/list` response](https://distribution.github.io/distribution/spec/api/#listing-image-tags) can consist of multiple pages,
using the `FollowRelLink` switch of the [`Invoke-RestMethod` cmdlet](https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/invoke-restmethod) will automatically stack the results of all pages together for us.

```powershell title="PowerShell"
$tags = Invoke-RestMethod `
            -Authentication Basic `
            -Credential $DockerCredential `
            -Uri "https://lorem.azurecr.io/v2/$Name/tags/list" `
            -FollowRelLink `
        | Select-Object -ExpandProperty tags
```

## Filter tags

With the list of tags, we can select which tags we want to remove.
If you use some form of versioning in your tags, like [SemVer](https://semver.org/), you can easily filter them using the [`Version` class](https://learn.microsoft.com/dotnet/api/system.version).

This ensures `2.0` is smaller than `10.0`, which is better than performing a textual comparison, as that would reason otherwise.

```powershell title="PowerShell"
$tags | ? { [Version]$_ -lt [Version]'2.0.0' } | % {
    $tag = $_

    # More code here later
}
```

Sadly, we cannot just remove the tagged version directly.
We can only [delete an image](https://distribution.github.io/distribution/spec/api/#deleting-an-image) using the `digest` as the reference.

## Retrieve the digest

To get the digest, we can request details of the specific tag.
The digest will be part of the response headers under the key `Docker-Content-Digest`.
To get access to the response headers we will not use the `Invoke-RestMethod` here, but the [`Invoke-WebRequest` cmdlet](https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/invoke-webrequest) instead.
And as we only need the headers, we can reduce network traffic by specifying the HTTP `HEAD` method.

There is also a caveat.
The `Docker-Content-Digest` header only holds the correct value if we specify an `Accept` header with the value `application/vnd.docker.distribution.manifest.v2+json`.

```powershell title="PowerShell"
$response = Invoke-WebRequest `
                -Method Head `
                -Authentication Basic `
                -Credential $DockerCredential `
                -Uri "https://lorem.azurecr.io/v2/$Name/manifests/$tag" `
                -Headers @{ 'Accept' = 'application/vnd.docker.distribution.manifest.v2+json' }

$digest = $response.Headers['Docker-Content-Digest']
```

## Delete the image

And finally, we can use the HTTP `DELETE` method on our image with the digest connected to the tag we wanted to remove.

```powershell title="PowerShell"
Invoke-WebRequest `
    -Method Delete `
    -Authentication Basic `
    -Credential $DockerCredential `
    -Uri "https://lorem.azurecr.io/v2/$Name/manifests/$digest" `
    | Select-Object -ExpandProperty StatusDescription
```
