#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsServiceWithLoggingStack } from '../lib/ecs_service_with_logging-stack';

const app = new cdk.App();
new EcsServiceWithLoggingStack(app, 'EcsServiceWithLoggingStack');
