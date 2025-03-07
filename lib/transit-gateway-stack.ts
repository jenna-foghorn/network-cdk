import * as base from "../lib/template/stack/base-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { AppContext } from "../lib/template/app-context";

export class TransitGatewayStack extends base.BaseStack {
  constructor(appContext: AppContext, stackConfig: any) {
    super(appContext, stackConfig);

    const transitGatewayConfig = stackConfig.transitGateway || {};

    // Create the Transit Gateway
    const transitGateway = new ec2.CfnTransitGateway(this, "TransitGateway", {
      amazonSideAsn: transitGatewayConfig.amazonSideAsn || 64512,
      autoAcceptSharedAttachments: transitGatewayConfig.autoAcceptSharedAttachments || "enable",
      defaultRouteTableAssociation: transitGatewayConfig.defaultRouteTableAssociation || "enable",
      defaultRouteTablePropagation: transitGatewayConfig.defaultRouteTablePropagation || "enable",
      vpnEcmpSupport: transitGatewayConfig.vpnEcmpSupport || "enable",
      dnsSupport: transitGatewayConfig.dnsSupport || "enable",
      multicastSupport: transitGatewayConfig.multicastSupport || "disable",
      tags: [{ key: "Name", value: transitGatewayConfig.name || "TransitGateway" }],
    });

    this.exportOutput("TransitGatewayId", transitGateway.ref);

    // Attach VPCs in the same account as the Transit Gateway
    if (transitGatewayConfig.vpcAttachments && transitGatewayConfig.vpcAttachments.length > 0) {
      transitGatewayConfig.vpcAttachments.forEach((vpc: any, index: number) => {
        new ec2.CfnTransitGatewayAttachment(this, `VpcAttachment${index}`, {
          transitGatewayId: transitGateway.ref,
          vpcId: vpc.vpcId,
          subnetIds: vpc.subnetIds,
          tags: [{ key: "Name", value: vpc.name }],
        });

        this.exportOutput(`VpcAttachment${index}Id`, vpc.vpcId);
      });
    }
  }
}
