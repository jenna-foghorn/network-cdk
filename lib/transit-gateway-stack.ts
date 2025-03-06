import * as base from "./template/stack/base-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { AppContext } from "../lib/template/app-context";

export class TransitGatewayStack extends base.BaseStack {
  constructor(appContext: AppContext, stackConfig: any) {
    super(appContext, stackConfig);

    // Extract transit gateway configuration from stackConfig
    const transitGatewayConfig = stackConfig.transitGateway || {};

    // Define the Transit Gateway
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

    // Use BaseStack's exportOutput method (if available)
    this.exportOutput("TransitGatewayId", transitGateway.ref);

    // Create VPC Attachments if defined in stackConfig
    if (transitGatewayConfig.vpcAttachments) {
      transitGatewayConfig.vpcAttachments.forEach((vpc: any, index: number) => {
        const attachment = new ec2.CfnTransitGatewayAttachment(this, `VpcAttachment${index}`, {
          subnetIds: vpc.subnetIds,
          transitGatewayId: transitGateway.ref,
          vpcId: vpc.vpcId,
          tags: [{ key: "Name", value: vpc.name }],
        });

        // Use BaseStack's exportOutput method for VPC Attachments
        this.exportOutput(`VpcAttachment${index}Id`, attachment.ref);
      });
    }
  }
}
