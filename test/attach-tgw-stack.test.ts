import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { AttachTransitGatewayStack } from "../lib/attach-tgw-stack"; // UPDATED
import { AppContext } from "../lib/template/app-context";

test("AttachTransitGatewayStack creates a Transit Gateway Attachment", () => {
  const app = new cdk.App();

  const appContext = new AppContext({
    appConfigFileKey: "config/test.json",
  });

  const stackConfig = appContext.appConfig.Stack.attachTransitGateway;

  const stack = new AttachTransitGatewayStack(appContext, stackConfig);

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::EC2::TransitGatewayAttachment", {
    TransitGatewayId: Match.anyValue(),
    VpcId: Match.anyValue(),
    SubnetIds: Match.anyValue(),
  });

  template.hasOutput("VpcAttachment0Id", {});
});

