import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AppContext } from "./template/app-context";
import { BaseStack } from "./template/stack/base-stack";
import { AttachTransitGatewayConfig } from "./config-types";

export class AttachTransitGatewayStack extends BaseStack {
  constructor(appContext: AppContext, stackConfig: AttachTransitGatewayConfig) {
    super(appContext, stackConfig);

    const attachConfig = stackConfig;

    const transitGatewayId = attachConfig.transitGatewayId;

    if (!transitGatewayId) {
      throw new Error("transitGatewayId is required for AttachTransitGatewayStack");
    }

    attachConfig.vpcAttachments.forEach((vpc, idx) => {
      new ec2.CfnTransitGatewayAttachment(this, `VpcAttachment${idx}`, {
        transitGatewayId,
        vpcId: vpc.vpcId,
        subnetIds: vpc.subnetIds,
        tags: [{ key: "Name", value: vpc.name || `Attachment${idx}` }],
      });
    });
  }
}
