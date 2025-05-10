import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { TransitGatewayStack } from "../lib/tgw-stack";
import { AppContext } from "../lib/template/app-context";

describe("TransitGatewayStack", () => {
  beforeEach(() => {
    process.env["APP_CONFIG"] = "config/networking.json"; // Primarily for networking.json
  });

  test("matches the snapshot if configured", () => {
    const appContext = new AppContext({ appConfigFileKey: "APP_CONFIG" });
    if (!appContext.appConfig.Stack.transitGateway) {
      console.warn(
        "Skipping TransitGatewayStack test: transitGateway is not defined in config.",
      );
      return;
    }
    const stack = new TransitGatewayStack(
      appContext,
      appContext.appConfig.Stack.transitGateway,
    );
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
