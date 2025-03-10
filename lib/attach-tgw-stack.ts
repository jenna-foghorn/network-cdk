import * as base from "../lib/template/stack/base-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AppContext } from "../lib/template/app-context";

export class AttachTransitGatewayStack extends base.BaseStack {
  constructor(appContext: AppContext, stackConfig: any) {
    super(appContext, stackConfig);

    // Important: You cannot accept RAM resource shares directly via CloudFormation/CDK today. This is a known limitation of AWS' resource modeling in CDK and CloudFormation.

    if (!stackConfig.transitGatewayId) throw new Error("Missing 'transitGatewayId'.");

    const transitGatewayId = stackConfig.transitGatewayId;

    stackConfig.vpcAttachments?.forEach((vpc: any, index: any) => {
      const attachment = new ec2.CfnTransitGatewayAttachment(this, `VpcAttachment${index}`, {
        transitGatewayId,
        vpcId: vpc.vpcId,
        subnetIds: vpc.subnetIds,
        tags: [{ key: "Name", value: vpc.name }],
      });

      this.exportOutput(`VpcAttachment${index}Id`, attachment.ref);

      // if (vpc.propagateToRouteTable) {
      //   new ec2.CfnTransitGatewayRouteTablePropagation(this, `VpcAttachment${index}Propagation`, {
      //     transitGatewayAttachmentId: attachment.ref,
      //     transitGatewayRouteTableId: vpc.propagateToRouteTable,
      //   });
      // }
    });
  }
}
