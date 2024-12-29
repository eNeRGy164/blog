---
id: 1275
title: ‘docker run’ throws “exec user process” errors
date: 2018-01-24T16:48:41+01:00
updated: 2020-12-07T17:50:07+01:00
author: Michaël Hompus
excerpt: >
  When recently creating a Linux Docker image using Docker for Windows,
  I ran into a couple of vague errors.
  Searching online for the error messages, weren’t any solutions.
  But luckily some suggestions put me on the right track.

  In this post I write about the solutions I found.
permalink: /2018/01/24/docker-run-throws-exec-user-process-errors/
image: /wp-content/uploads/2018/01/post-1275-thumbnail.png
categories:
  - Docker
  - Windows
tags:
  - Charset
  - Docker
  - Docker Desktop
  - Linefeed
  - Unicode
  - Windows
---

When recently creating a Linux [Docker](https://www.docker.com/) image using
[Docker Desktop for Windows](https://docs.docker.com/docker-for-windows/),
I ran into a couple of vague errors.
Searching online for the error messages, there weren’t any solutions.
But luckily some suggestions put me on the right track.

In this post I describe the solutions I found.
Hopefully preventing you wasting time on the same issues.

<!--more-->

## The Dockerfile

My Dockerfile is based on the [Azure App Service WordPress 0.3 Dockerfile](https://github.com/Azure-App-Service/apps/blob/master/Wordpress/0.3/Dockerfile).

In relation to the errors I encountered, the most important part in this file is the [ENTRYPOINT](https://docs.docker.com/engine/reference/builder/#entrypoint) that is declared:

```dockerfile
ENTRYPOINT ["entrypoint.sh"]
```

After adding the `entrypoint.sh` file to the directory where I build my image, I ran the <kbd>docker build</kbd> command:

```shell title="Docker"
docker build --tag blog/demo:v1 .
```

Once the build was completed, I launched the image locally:

```shell title="Docker"
docker run blog/demo:v1
```

But that was not as straight forward as expected.

## Linefeed matter: `no such file or directory`

First, I got the following response:

```plain
standard_init_linux.go:195: exec user process caused "no such file or directory"
```

This is quite a generic error message and can describe a lot of files or directories that are part of the process of building and running Docker images and containers.
My first impression was that the image building was not working correctly.
But after a lot of rebuilds, the error didn’t go away.

I finally found the real source of the issue: changing the linefeed in the `entrypoint.sh` file from `CRLF` to `LF`, somehow made the file discoverable.

![Visual Studio Code showing CRLF in the status bar](/wp-content/uploads/2018/01/visual-studio-code-showing-crlf.png "Visual Studio Code showing CRLF in the status bar")

![Changing the linefeed option in Visual Studio Code](/wp-content/uploads/2018/01/visual-studio-code-changing-linefeed.png "Changing the linefeed option")

However, I still couldn't run my container, only the error message had changed…

## Encoding matters: `exec format error`

Executing the <kbd>docker run</kbd> command again, the output was now a different error:

```plain
standard_init_linux.go:195: exec user process caused "exec format error"
```

The mentioning of a "format error" made me guess that this had something to do with incompatibilities running a Linux image on a Windows OS, or something related to x86 vs. x64. Many articles you’ll find searching on the error message are pointing in that direction.

Luckily, I overheard a colleague solving a completely unrelated issue by changing the encoding of his XML file from `UTF-8` to `ISO-8859-15`.
I figured to just try that with my file… solving the issue!

![Save the file with encoding dialog in Visual Studio Code](/wp-content/uploads/2018/01/visual-studio-code-save-with-reencoding.png "Save the file with encoding")

![Select the file encoding dialog in Visual Studio Code](/wp-content/uploads/2018/01/visual-studio-code-select-encoding.png "Select the file encoding")

## Conclusion

When using Docker on Windows and working with Linux containers,
make sure the encoding and linefeed of the files involved are correct,
otherwise you are hit with vague error messages that are not helpful at all.
