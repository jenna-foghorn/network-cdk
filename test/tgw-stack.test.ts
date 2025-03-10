import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { TransitGatewayStack } from "../lib/tgw-stack"; // UPDATED
import { AppContext } from "../lib/template/app-context";

test("TransitGatewayStack creates a Transit Gateway", () => {
  const app = new cdk.App();

  const appContext = new AppContext({
    appConfigFileKey: "config/test.json",
  });

  const stackConfig = appContext.appConfig.Stack.transitGateway;

  const stack = new TransitGatewayStack(appContext, stackConfig);

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::EC2::TransitGateway", {
    AmazonSideAsn: Match.anyValue(),
    AutoAcceptSharedAttachments: Match.anyValue(),
    DefaultRouteTableAssociation: Match.anyValue(),
    DefaultRouteTablePropagation: Match.anyValue(),
    VpnEcmpSupport: Match.anyValue(),
    DnsSupport: Match.anyValue(),
    MulticastSupport: Match.anyValue(),
  });

  template.hasOutput("TransitGatewayId", {});
});
