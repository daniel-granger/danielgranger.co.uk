---
title: "Aspire: Shifting Observability Left"
date: 2026-09-16
draft: false
description: Desc
categories:
  - telemetry
---
You pick up a story, write the code, write the unit tests and watch the suite go green. Edge cases pass, the PR merges, and you move on to the next thing.

Three days later, your alerts start firing. The application hasn’t crashed, but your logs are bleeding noise: a cascade of `NullReferenceException` entries in Elastic and Application Insights every time an external call returns empty.

In an era where developers are able to utilise agentic coding to churn out working code in seconds, we've largely solved the syntax problem only to worsen the operational one. Both AI and good developers can write code that *functions*, but rarely code that *observes*.

I'm no perfect developer myself, and have fallen into this trap plenty of times. Revisiting code I wrote a few weeks prior because of an now obvious oversight is something we can all sympathise to.

When working day-to-day across multi-layered solutions - perhaps a .NET website tethered to an Umbraco CMS, backed by Redis, databases and external third-party services - *"it runs on my machine"* only validates an isolated happy path: you gave it the environmental constraints, of which are mostly incomparable to production. How many times have you developed a new feature, whilst ensuring your locally running CMS is handling 10,000 concurrent connections at the same time?

Enter [Aspire](https://aspire.dev).

![Browser screenshot of the aspire.dev homepage, it's title: "Compose distributed apps in code." ](/images/aspire_homepage.png "Aspire Homepage")

Most documentation and blogs write about Aspire as the perfect orchestration framework
