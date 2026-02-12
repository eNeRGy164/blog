---
id: 1495
title: "Trick Bamboo’s MSTest parser when we skip running our tests"
date: 2020-07-07T13:57:40+02:00
updated: 2020-12-07T17:56:14+01:00
author: Michaël Hompus
excerpt: >
  I use the MSTest Parser task in a Bamboo build plan to add a report of tests that were executed and their outcome.
  But sometimes you want to skip running tests.
  For example, you are focusing on other changes in your CI/CD pipeline and want to keep the feedback loop as short as possible.

  The problem is, if you don't run any tests, the parser task will fail. There are no configuration settings to influence this behavior or to disable the task conditionally. I could disable the task manually, but that would affect all other branches at the same time.

  So, I found it was time to create a quick work around.
permalink: /2020/07/07/trick-bamboos-mstest-parser-when-we-skip-running-our-tests/
image: /wp-content/uploads/2020/07/post-2020-07-07-thumbnail.png
categories:
  - PowerShell
tags:
  - Bamboo
  - CI/CD
  - MSTest
  - PowerShell
  - Task
  - Work around
---

I use the [MSTest Parser task](https://confluence.atlassian.com/bamboo/mstest-parser-289277057.html) in a [Bamboo](https://www.atlassian.com/software/bamboo) build plan to add a report of tests that were executed and their outcome.
But sometimes you want to skip running tests.
For example, you are focusing on other changes in your CI/CD pipeline and want to keep the feedback loop as short as possible.

The problem is, if you do not run any tests, the parser task will fail.
There are no configuration settings to influence this behavior or to disable the task conditionally.
I could disable the task manually, but that would affect all other branches at the same time.

![Bamboo complaining that no failed tests were found.](/wp-content/uploads/2020/07/bamboo_complaining_no_tests_found.png "Bamboo complaining about not finding any failed tests… which would be a good case in my book")

So, it was time to create a quick work around.

<!--more-->

## Creating a fake test run

> [!NOTE]
> I am working with [PowerShell Core](https://github.com/powershell/powershell) in my Bamboo environment,
> but the same can be achieved in other scripting languages.

If you want to run tests conditionally, you will have a variable that indicates this.
The value can be the result of script execution or you have it configured as a variable on your build plan or branch.

Let us assume there is an environment variable called `bamboo_run_tests` and holds the value `false`.
Now we create a fake test run result that can be picked up by the parser.

```powershell
if (${env:bamboo_run_tests} -eq 'false') {
@"
<TestRun>
    <Results>
        <UnitTestResult testId="00000000-0000-0000-0000-000000000001" testName="Skipped" duration="00:00:00" outcome="Passed" />
    </Results>
    <TestDefinitions>
    <UnitTest id="00000000-0000-0000-0000-000000000001">
        <TestMethod className="ComponentTest" />
    </UnitTest>
    </TestDefinitions>
</TestRun>
"@ | Out-File skippedtestrun.trx -Encoding ascii
}
```

Now we have a `.trx` file that can be inspected by the parser and it will not fail our build pipeline anymore.

![Bamboo reporting on the skipped test run.](/wp-content/uploads/2020/07/bamboo_reporting_the_skipped_testrun.png "Bamboo reporting on the skipped test run.")

Instead of showing the test as `Passed`, we could maybe show a different status.
But this was good enough of a fix to get my feedback loop short and move on to the task I wanted actually to work on.

If you have suggestions to this trick, let me know.
