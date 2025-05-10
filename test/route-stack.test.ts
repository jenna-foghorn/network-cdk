import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { RouteStack } from "../lib/route-stack";
import { AppContext } from "../lib/template/app-context";

describe("RouteStack", () => {
  beforeEach(() => {
    process.env["APP_CONFIG"] = "config/networking.json"; // Works with both configs
  });

  test("matches the snapshot if configured", () => {
    const appContext = new AppContext({ appConfigFileKey: "APP_CONFIG" });
    if (!appContext.appConfig.Stack.externalRoutes) {
      console.warn(
        "Skipping RouteStack test: externalRoutes is not defined in config.",
      );
      return;
    }
    const stack = new RouteStack(
      appContext,
      appContext.appConfig.Stack.externalRoutes,
    );
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
