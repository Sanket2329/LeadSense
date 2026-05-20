using LeadSense.Api.Common;
using LeadSense.Infrastructure.Repository.Common;
using LeaseSense.Application.Common;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationLayer();
builder.Services.AddRepository();


var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.RegisterEndpoints();

app.Run();

