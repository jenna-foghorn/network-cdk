import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { AttachTransitGatewayStack } from "../lib/attach-tgw-stack";
import { AppContext } from "../lib/template/app-context";

describe("AttachTransitGatewayStack", () => {
  beforeEach(() => {
    process.env["APP_CONFIG"] = "config/staging.json"; // Primarily for staging.json
  });

  test("matches the snapshot if configured", () => {
    const appContext = new AppContext({ appConfigFileKey: "APP_CONFIG" });
    if (!appContext.appConfig.Stack.attachTransitGateway) {
      console.warn(
        "Skipping AttachTransitGatewayStack test: attachTransitGateway is not defined in config.",
      );
      return;
    }
    const stack = new AttachTransitGatewayStack(
      appContext,
      appContext.appConfig.Stack.attachTransitGateway,
    );
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
