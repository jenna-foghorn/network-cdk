import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { AcceptTransitGatewayStack } from "../lib/accept-transit-gateway-stack";
import { AppContext } from "../lib/template/app-context";

test("AcceptTransitGatewayStack creates a Transit Gateway Attachment", () => {
  const app = new cdk.App();

  const appContext = new AppContext({
    appConfigFileKey: "config/test.json",
  });

  const stackConfig = {
    transitGatewayId: appContext.appConfig.Stack.transitGatewayId,
    vpcAttachments: appContext.appConfig.Stack.vpcAttachments
  };

  const stack = new AcceptTransitGatewayStack(appContext, stackConfig);

  const template = Template.fromStack(stack);

  // Validate only that required properties exist
  template.hasResourceProperties("AWS::EC2::TransitGatewayAttachment", {
    TransitGatewayId: Match.anyValue(),
    VpcId: Match.anyValue(),
    SubnetIds: Match.anyValue(),
  });

  template.hasOutput("VpcAttachment0Id", {});
});
