import * as base from "../lib/template/stack/base-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ram from "aws-cdk-lib/aws-ram";
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

    // Share Transit Gateway with other AWS accounts (sharedWithAccounts)
    if (transitGatewayConfig.sharedWithAccounts && transitGatewayConfig.sharedWithAccounts.length > 0) {
      new ram.CfnResourceShare(this, "TransitGatewayResourceShare", {
        name: "TransitGatewayShare",
        allowExternalPrincipals: false,
        principals: transitGatewayConfig.sharedWithAccounts,
        resourceArns: [`arn:aws:ec2:${this.region}:${this.account}:transit-gateway/${transitGateway.ref}`],
      });
    }

    // Create Transit Gateway Route Tables
    const routeTables: { [key: string]: ec2.CfnTransitGatewayRouteTable } = {};

    if (transitGatewayConfig.routeTables) {
      transitGatewayConfig.routeTables.forEach((rt: any) => {
        const routeTable = new ec2.CfnTransitGatewayRouteTable(this, rt.name, {
          transitGatewayId: transitGateway.ref,
          tags: [{ key: "Name", value: rt.name }],
        });

        routeTables[rt.name] = routeTable;
        this.exportOutput(`${rt.name}Id`, routeTable.ref);
      });
    }

    // Attach VPCs in the same account as the Transit Gateway and associate them with Route Tables
    if (transitGatewayConfig.vpcAttachments) {
      transitGatewayConfig.vpcAttachments.forEach((vpc: any, index: any) => {
        const attachment = new ec2.CfnTransitGatewayAttachment(this, `VpcAttachment${index}`, {
          transitGatewayId: transitGateway.ref,
          vpcId: vpc.vpcId,
          subnetIds: vpc.subnetIds,
          tags: [{ key: "Name", value: vpc.name }],
        });

        this.exportOutput(`VpcAttachment${index}Id`, attachment.ref);

        // Associate VPC attachment with Route Table if specified
        if (vpc.associateWithRouteTable && transitGatewayConfig.routeTables.length > 0) {
          new ec2.CfnTransitGatewayRouteTableAssociation(this, `VpcAttachment${index}RouteTableAssociation`, {
            transitGatewayAttachmentId: attachment.ref,
            transitGatewayRouteTableId: routeTables["HubRouteTable"].ref,
          });
        }
      });
    }
  }
}
