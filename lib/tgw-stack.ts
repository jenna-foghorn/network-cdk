import * as base from "../lib/template/stack/base-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ram from "aws-cdk-lib/aws-ram";
import { AppContext } from "../lib/template/app-context";

export class TransitGatewayStack extends base.BaseStack {
  constructor(appContext: AppContext, stackConfig: any) {
    super(appContext, stackConfig);

    const transitGatewayConfig = stackConfig || {};

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

    // // Creating a Resource Share in AWS Resource Access Manager
    // if (transitGatewayConfig.sharedWithAccounts?.length) {
    //   new ram.CfnResourceShare(this, "TransitGatewayResourceShare", {
    //     name: "TransitGatewayShare",
    //     allowExternalPrincipals: false, // or true depending on your sharing policy
    //     principals: transitGatewayConfig.sharedWithAccounts,
    //     resourceArns: [`arn:aws:ec2:${this.region}:${this.account}:transit-gateway/${transitGateway.ref}`],
    //     tags: [{ key: "Name", value: "TransitGatewayShare" }],
    //   });
    // }

    // Share TransitGateway with other AWS accounts by Creating a Resource Share in AWS Resource Access Manager
    let resourceShare: ram.CfnResourceShare | undefined = undefined;

    if (transitGatewayConfig.sharedWithAccounts && transitGatewayConfig.sharedWithAccounts.length > 0) {
      resourceShare = new ram.CfnResourceShare(this, "TransitGatewayResourceShare", {
        name: "TransitGatewayShare",
        allowExternalPrincipals: false, // or true depending on your sharing policy
        principals: transitGatewayConfig.sharedWithAccounts,
        resourceArns: [
          `arn:aws:ec2:${this.region}:${this.account}:transit-gateway/${transitGateway.ref}`,
        ],
        tags: [{ key: "Name", value: "TransitGatewayShare" }],
      });

      // Export the RAM Resource Share ARN for use in other accounts
      this.exportOutput("TransitGatewayResourceShareArn", resourceShare.attrArn);
    }



    // const routeTables: { [key: string]: ec2.CfnTransitGatewayRouteTable } = {};

    // if (transitGatewayConfig.routeTables) {
    //   transitGatewayConfig.routeTables.forEach((rt: any) => {
    //     const routeTable = new ec2.CfnTransitGatewayRouteTable(this, rt.name, {
    //       transitGatewayId: transitGateway.ref,
    //       tags: [{ key: "Name", value: rt.name }],
    //     });
    //     routeTables[rt.name] = routeTable;
    //     this.exportOutput(`${rt.name}Id`, routeTable.ref);
    //   });
    // }

    transitGatewayConfig.vpcAttachments?.forEach((vpc: any, index: any) => {
      const attachment = new ec2.CfnTransitGatewayAttachment(this, `VpcAttachment${index}`, {
        transitGatewayId: transitGateway.ref,
        vpcId: vpc.vpcId,
        subnetIds: vpc.subnetIds,
        tags: [{ key: "Name", value: vpc.name }],
      });

      this.exportOutput(`VpcAttachment${index}Id`, attachment.ref);

      // if (vpc.associateWithRouteTable && transitGatewayConfig.routeTables?.length) {
      //   new ec2.CfnTransitGatewayRouteTableAssociation(this, `VpcAttachment${index}Association`, {
      //     transitGatewayAttachmentId: attachment.ref,
      //     transitGatewayRouteTableId: routeTables["HubRouteTable"].ref,
      //   });
      // }
    });
  }
}
