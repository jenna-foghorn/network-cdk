#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AppContext } from "../lib/template/app-context";
import { VpcStack } from "../lib/vpc-stack";
import { TransitGatewayStack } from "../lib/tgw-stack";
import { AttachTransitGatewayStack } from "../lib/attach-tgw-stack";
import { RouteStack } from "../lib/route-stack";

const app = new cdk.App();

if (!process.env["APP_CONFIG"]) {
  throw new Error(
    "APP_CONFIG environment variable must be set to a config file path.",
  );
}

const appContext = new AppContext({ appConfigFileKey: "APP_CONFIG" });
const stackConfig = appContext.appConfig.Stack || {};

if (!stackConfig.vpc) {
  throw new Error("The 'vpc' configuration is required in the Stack section.");
}

const deployedStacks: { [key: string]: cdk.Stack } = {};

// Always instantiate VpcStack, whether creating new or using existing VPC
console.log(
  `Processing VPC Stack: ${stackConfig.vpc.Name || stackConfig.vpc.vpcId}`,
);
const vpcStack = new VpcStack(appContext, stackConfig.vpc);
deployedStacks["vpc"] = vpcStack;
const vpc: ec2.IVpc = vpcStack.vpc; // Access the vpc from the stack

// Process other optional stacks
Object.keys(stackConfig).forEach((stackKey) => {
  const config = stackConfig[stackKey];

  switch (stackKey) {
    case "vpc":
      break;

    case "transitGateway":
      if (config) {
        console.log(`Deploying Transit Gateway Stack: ${config.Name}`);
        const tgwStack = new TransitGatewayStack(appContext, config);
        deployedStacks["transitGateway"] = tgwStack;
        tgwStack.addDependency(deployedStacks["vpc"]);
      }
      break;

    case "attachTransitGateway":
      if (config) {
        console.log(`Deploying Attach Transit Gateway Stack: ${config.Name}`);
        const attachStack = new AttachTransitGatewayStack(appContext, config);
        deployedStacks["attachTransitGateway"] = attachStack;
        if (deployedStacks["transitGateway"]) {
          attachStack.addDependency(deployedStacks["transitGateway"]);
        }
      }
      break;

    case "externalRoutes":
      if (config) {
        console.log(`Deploying External Routes Stack: ${config.Name}`);
        const routeStack = new RouteStack(appContext, config);
        deployedStacks["externalRoutes"] = routeStack;
        routeStack.addDependency(deployedStacks["vpc"]);
      }
      break;

    default:
      console.warn(`Unknown stack key: ${stackKey}. Skipping...`);
  }
});

console.log("Stack initialization complete.");
