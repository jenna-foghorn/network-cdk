import * as base from "../lib/template/stack/base-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { AppContext } from "../lib/template/app-context";

export class AcceptTransitGatewayStack extends base.BaseStack {
  constructor(appContext: AppContext, stackConfig: any) {
    super(appContext, stackConfig);

    if (!stackConfig.transitGatewayId) {
      throw new Error("Missing required parameter: transitGatewayId.");
    }

    const transitGatewayId = stackConfig.transitGatewayId;

    if (!stackConfig.vpcAttachments || stackConfig.vpcAttachments.length === 0) {
      throw new Error("No VPC attachments specified.");
    }

    stackConfig.vpcAttachments.forEach((vpc: any, index: number) => {
      new ec2.CfnTransitGatewayAttachment(this, `VpcAttachment${index}`, {
        transitGatewayId,
        vpcId: vpc.vpcId,
        subnetIds: vpc.subnetIds,
        tags: [{ key: "Name", value: vpc.name }],
      });

      this.exportOutput(`VpcAttachment${index}Id`, transitGatewayId);
    });
  }
}
