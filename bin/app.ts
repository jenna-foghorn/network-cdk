#!/usr/bin/env node
import "source-map-support/register";
import { AppContext } from "../lib/template/app-context";
import { TransitGatewayStack } from "../lib/transit-gateway-stack";

const appContext = new AppContext({
  appConfigFileKey: "APP_CONFIG",
});

// Deploy Stack
new TransitGatewayStack(appContext, appContext.appConfig.Stack.transitGateway);

// // improves error stack traces when running CDK
// import "source-map-support/register";
// import { AppContext } from "../lib/template/app-context";
// import { TransitGatewayStack } from "../lib/transit-gateway-stack";
// import { AcceptTransitGatewayStack } from "../lib/accept-transit-gateway-stack";

// // const app = new cdk.App();

// // Get the target environment from a CLI argument or env variable
// const envName = process.env.APP_ENV || "hub"; // Default to hub
// const configFile = `config/${envName}.json`;

// const appContext = new AppContext({
//   appConfigFileKey: configFile,
// });

// if (envName === "hub") {
//   new TransitGatewayStack(appContext, appContext.config);
// } else {
//   new AcceptTransitGatewayStack(appContext, appContext.config);
// }


