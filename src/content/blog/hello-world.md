---
title: Hello World
date: 2026-05-01
description: My first blog post exploring the basics of building this site.
---
This is my first blog post. I'm excited to share my thoughts and projects with you.

In this post, I'll be discussing the fundamentals of getting started with personal blogging and why I decided to build this site from scratc



```csharp
using DeveloperAssessment.Web.Repositories;
using DeveloperAssessment.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();

builder.Services.AddScoped<IBlogRepository, BlogRepository>();
builder.Services.AddScoped<IBlogService, BlogService>();
```
