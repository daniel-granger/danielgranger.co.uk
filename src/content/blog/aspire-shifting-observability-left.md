---
title: "Aspire: Shifting Observability Left"
date: 2026-09-16
draft: false
description: Desc
categories:
  - telemetry
---
You pick up a story; implement the code; ensure it’s covered with tests and check it runs.

Great, it works. You perform some edge-case tests, raise a PR, merge and forget.

You don't realise it, but you just created yourself, and other developers a headache down the line. Your new endpoint is throwing errors into your logs, causing a considerable amount of noise and setting off alerts - even if it doesn't cause the application to restart.

Naturally, you might turn to something like Azure's Application Insights, following the traces from your calls to see where the problem lies, or filtering through your logs in Elastic to pinpoint the exact error being thrown: a `NullReferenceException` every time your query returns no data.

Especially in the age of agentic coding, it's all too easy for developers
