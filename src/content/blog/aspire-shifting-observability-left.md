---
title: "Aspire: Shifting Observability Left"
date: 2026-09-16
draft: false
description: Stop blind debugging. Discover how fitting Aspire into existing
  solutions brings instant OpenTelemetry traces and observability into your
  local development loop.
categories:
  - telemetry
---
You pick up a story, write the code, write the unit tests and watch the suite go green. Edge cases pass, the PR merges, and you move on to the next task.

Three days later, your alerts start firing. The application hasn’t crashed, but your logs are bleeding noise: a cascade of `NullReferenceException` entries in Elastic and Application Insights every time an external call returns empty.

In an era where developers are able to utilise agentic coding to churn out working code in seconds, we've largely solved the syntax problem only to worsen the operational one. Both AI and good developers can write code that *functions*, but rarely code that *observes*.

I'm no perfect developer myself, and have fallen into this trap plenty of times. Revisiting code I wrote a few weeks prior because of a now obvious oversight is something we can all sympathise with.

When working day-to-day across multi-layered solutions - perhaps a .NET website tethered to an Umbraco CMS, backed by Redis, databases and external third-party services - *"it runs on my machine"* only validates an isolated happy path. Localhost gives your application the best case scenario: low-latency connections to caches, databases and empty log buffers masking debt that production exposes.

Enter [Aspire](https://aspire.dev).

![Browser screenshot of the Aspire dashboard, it shows a multi-layered web application consisting of Redis, Umbraco, a .NET website and a Vue SSR renderer, all running.](/images/aspire_dashboard.png "Aspire's Resources Dashboard")

Most documentation or blogs write about Aspire as the perfect framework for new projects, the way for every developer to *aspire* to orchestrate their application; however, it's been incredibly powerful to hook into existing website solutions to gain a deeper understanding into why an endpoint stutters, why a CMS lookup stalls, or which database call is silently running multiple times per page request after a cache miss.

It's amazingly easy to set up, as well. I often find myself using the [Aspireify](https://aspire.dev/get-started/add-aspire-existing-app/#recommended-use-an-ai-coding-agent-with-the-aspireify-skill) skill to allow my agent to tie the application together, all with first class OpenTelemetry support.

### Let's take a look at an example

You have a registration form: it accepts user details, stores them in Azure Blob Storage, and makes a request to an external CRM system to create the new contact in the system. QA flag that the form takes 10 seconds to submit - *strange*.

Traditionally, you may have thought to start the application locally, set a breakpoint, and step through your code line-by-line, waiting for an exception to throw or some asynchronous call to hang. You have no timings, of course, so might drop in a temporary stopwatch around code you suspect might be the problem. Of course, you often step back in code to rerun a call, as you weren't sure if your IDE caused a slowdown, or if there was a legitimate problem.

With Aspire? You just run it. Through OpenTelemetry metrics collated into the dashboard, you can gain an immediate insight into the problematic code:

![Browser screenshot of a trace in Aspire.](/images/aspire_trace.png "An Aspire Trace")

There it is: a 10-second wait for the CRM. Rather than waiting around on the vendor, the trace makes the architectural fix immediate: decouple the synchronous HTTP request and push the submission to a background task. Regardless of where the latency originates, Aspire turns blind debugging into an instant diagnosis, letting you focus on writing resilient code.

### Setting this up

One misconception holding developers back from adopting Aspire is the fear that a full architectural overhaul is required. However, it actually comes down to two lightweight scaffolding projects: an orchestrator (`AppHost`) and a shared telemetry package (`ServiceDefaults`) - then registering a couple of extension methods in your startup pipeline. In most cases, you can be up and running in under 10 minutes fully instrumented for OpenTelemetry:

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var redis = builder.AddRedis("redis")
    .WithLifetime(ContainerLifetime.Persistent);

var cmsDb = builder.AddConnectionString("umbracoDbDSN");

var ssrService = builder.AddNodeApp("vue-ssr", "../ssr-service", "dist-ssr/server.js")
    .WithRunScript("start")
    .WithNpm()
    .WithHttpsEndpoint();

var cms = builder.AddProject("cms", "../cms")
    .WithReference(redis)
    .WaitFor(redis)
    .WithReference(cmsDb)
    .WithHttpsEndpoint();

var website = builder.AddProject("website", "../website")
    .WithReference(redis)
    .WithReference(cms)
    .WaitFor(cms)
    .WithReference(ssrService)
    .WaitFor(ssrService)
    .WithHttpsEndpoint();

builder.Build().Run();
```

And then in an existing project's `Program.cs`, you would add:

```csharp
// Register OpenTelemetry, logging, and default resilience handlers
builder.AddServiceDefaults();

// ... existing service configuration and middleware ...

// Expose health check and metrics endpoints for the Aspire dashboard
app.MapDefaultEndpoints();
```

That's all it takes. Shifting your observability left shouldn't require spinning up any complex infrastructure, or waiting for clients and users to notice bottlenecks in performance. By collating traces, metrics and logs directly into the local development loop, Aspire eliminates the guesswork and ensures that, alongside the green test suite, we're shipping software that not only functions, but truly observes.
