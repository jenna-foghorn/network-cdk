import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { VpcStack } from "../lib/vpc-stack";
import { AppContext } from "../lib/template/app-context";

describe("VpcStack", () => {
  beforeEach(() => {
    process.env["APP_CONFIG"] = "config/networking.json"; // Can be networking.json or staging.json
  });

  test("matches the snapshot if configured", () => {
    const appContext = new AppContext({ appConfigFileKey: "APP_CONFIG" });
    if (!appContext.appConfig.Stack.vpc) {
      console.warn("Skipping VpcStack test: vpc is not defined in config.");
      return;
    }
    const stack = new VpcStack(appContext, appContext.appConfig.Stack.vpc);
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
