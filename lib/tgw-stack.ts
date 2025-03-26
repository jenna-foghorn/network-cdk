import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ram from "aws-cdk-lib/aws-ram";
import { AppContext } from "./template/app-context";
import { BaseStack } from "./template/stack/base-stack";
import { TransitGatewayConfig } from "./config-types";

export class TransitGatewayStack extends BaseStack {
  public readonly transitGateway: ec2.CfnTransitGateway;

  constructor(appContext: AppContext, stackConfig: TransitGatewayConfig) {
    super(appContext, stackConfig);

    const tgwConfig = stackConfig;

    this.transitGateway = new ec2.CfnTransitGateway(this, "TransitGateway", {
      amazonSideAsn: tgwConfig.amazonSideAsn || 64512,
      autoAcceptSharedAttachments: "enable",
      defaultRouteTableAssociation: "enable",
      defaultRouteTablePropagation: "enable",
      vpnEcmpSupport: "enable",
      dnsSupport: "enable",
      multicastSupport: "disable",
      tags: [{ key: "Name", value: "TransitGateway" }],
    });

    this.exportOutput("TransitGatewayId", this.transitGateway.ref);

    if (tgwConfig.sharedWithAccounts?.length > 0) {
      new ram.CfnResourceShare(this, "TransitGatewayResourceShare", {
        name: "TransitGatewayShare",
        allowExternalPrincipals: false,
        principals: tgwConfig.sharedWithAccounts,
        resourceArns: [`arn:aws:ec2:${this.region}:${this.account}:transit-gateway/${this.transitGateway.ref}`],
        tags: [{ key: "Name", value: "TransitGatewayShare" }],
      });
    }

    if (tgwConfig.vpcAttachments?.length > 0) {
      tgwConfig.vpcAttachments.forEach((vpc, idx) => {
        new ec2.CfnTransitGatewayAttachment(this, `VpcAttachment${idx}`, {
          transitGatewayId: this.transitGateway.ref,
          vpcId: vpc.vpcId,
          subnetIds: vpc.subnetIds,
          tags: [{ key: "Name", value: vpc.name || `Attachment${idx}` }],
        });
      });
    }
  }
}
