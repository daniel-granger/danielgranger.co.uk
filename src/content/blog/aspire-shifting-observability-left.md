---
title: "Aspire: Shifting Observability Left"
date: 2026-09-16
draft: false
description: Desc
categories:
  - telemetry
---
You pick up a story, write the code, write the unit tests and watch the suite go green. Edge cases pass, the PR merges, and you move on to the next thing.

Three days later, your alerts start firing. The application hasn’t crashed, but your logs are bleeding noise: a cascade of `NullReferenceException` entries in Elastic or Azure Application Insights every time an external call returns empty. Your clean local data you developed against 

In an era where developers are able to utilise agentic coding to churn out working code in seconds, we've largely solved the syntax problem only to worsen the operational one. Both AI and good developers can write code that *functions*, but rarely code that *observes*.
