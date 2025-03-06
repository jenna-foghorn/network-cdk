import { Template } from "aws-cdk-lib/assertions";
import { TransitGatewayStack } from "../lib/transit-gateway-stack";
import { AppContext } from "../lib/template/app-context";

describe("TransitGatewayStack", () => {

  beforeEach(() => {
    process.env["APP_CONFIG"] = "config/test.json";
  });

  test("matches the snapshot", () => {
    const appContext = new AppContext({
      appConfigFileKey: "APP_CONFIG",
    });

    const stack = new TransitGatewayStack(
      appContext,
      appContext.appConfig.Stack.transitGateway,
    );

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });

});
