#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { EcsServiceWithLoggingStack } from "../lib/ecs_service_with_logging-stack";

const envUSA = { account: "<AWS-Account-ID>", region: "us-east-1" };

const app = new cdk.App();
new EcsServiceWithLoggingStack(app, "EcsServiceWithLoggingStack", {
  env: envUSA,
});
