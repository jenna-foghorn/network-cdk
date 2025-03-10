#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppContext } from "../lib/template/app-context";
import { TransitGatewayStack } from "../lib/tgw-stack"; // RENAMED
import { AttachTransitGatewayStack } from "../lib/attach-tgw-stack"; // RENAMED

const app = new cdk.App();

// Ensure APP_CONFIG is set
process.env["APP_CONFIG"] = process.env["APP_CONFIG"] || "config/hub.json";

// Load configuration
const appContext = new AppContext({ appConfigFileKey: "APP_CONFIG" });
const stackConfig = appContext.appConfig.Stack;

// Validate config
if (!stackConfig) {
  throw new Error("Invalid configuration: Stack section missing in config.");
}

// Determine which stack to deploy
if (stackConfig.transitGateway) {
  // Hub TGW Stack
  new TransitGatewayStack(appContext, stackConfig.transitGateway);
} else if (stackConfig.attachTransitGateway) {
  // Spoke TGW Attachment Stack
  new AttachTransitGatewayStack(appContext, stackConfig.attachTransitGateway);
} else {
  throw new Error("Invalid Stack configuration. No Transit Gateway or Attachments found.");
}
