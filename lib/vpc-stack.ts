import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AppContext } from "./template/app-context";
import { BaseStack } from "./template/stack/base-stack";
import { VpcStackConfig } from "./config-types";

export class VpcStack extends BaseStack {
  public readonly vpc: ec2.IVpc;

  constructor(appContext: AppContext, stackConfig: VpcStackConfig) {
    super(appContext, stackConfig);

    const vpcConfig = stackConfig;

    if (vpcConfig.useExistingVpc) {
      if (!vpcConfig.vpcId) {
        throw new Error("vpcId is required when useExistingVpc is true");
      }
      console.log(`Using existing VPC: ${vpcConfig.vpcId}`);
      this.vpc = ec2.Vpc.fromLookup(this, "ExistingVpc", {
        vpcId: vpcConfig.vpcId,
      });

      if (vpcConfig.routeTableIds?.length > 0) {
        vpcConfig.routeTableIds.forEach((rtbId: string, idx: number) => {
          this.exportOutput(`ProvidedRouteTable${idx + 1}Id`, rtbId);
        });
      }
    } else {
      if (vpcConfig.routeTableIds?.length > 0) {
        console.warn("Ignoring routeTableIds: not applicable when creating a new VPC");
      }

      const subnetConfigs: ec2.SubnetConfiguration[] = (vpcConfig.subnetConfiguration || []).map(
        (subnet: any) => ({
          cidrMask: subnet.cidrMask,
          name: subnet.name,
          subnetType: this.mapSubnetType(subnet.subnetType),
        })
      );

      const natGatewaySubnetLayer = vpcConfig.natGatewaySubnetLayer || "protected";
      const natSubnetConfig = subnetConfigs.find((subnet) => subnet.name === natGatewaySubnetLayer);
      const natGateways = natSubnetConfig?.subnetType === ec2.SubnetType.PUBLIC ? (vpcConfig.natGateways || 1) : 0;

      this.vpc = new ec2.Vpc(this, "VpcStack", {
        ipAddresses: ec2.IpAddresses.cidr(vpcConfig.cidr || "10.0.0.0/16"),
        maxAzs: vpcConfig.maxAzs || 2,
        natGateways,
        subnetConfiguration: subnetConfigs.length > 0 ? subnetConfigs : undefined,
        natGatewaySubnets: natGateways > 0 ? { subnetGroupName: natGatewaySubnetLayer } : undefined,
      });

      // Apply routes if provided
      if (vpcConfig.routes?.length > 0) {
        vpcConfig.routes.forEach((route, idx) => {
          const routeProps: ec2.CfnRouteProps = {
            routeTableId: this.vpc.publicSubnets[0].routeTable.routeTableId,
            destinationCidrBlock: route.destination,
          };
          if (route.target) {
            if (route.target.type === "TransitGateway" && route.target.transitGatewayId) {
              routeProps.transitGatewayId = route.target.transitGatewayId;
            } else if (route.target.type === "InternetGateway" && route.target.internetGatewayId) {
              routeProps.gatewayId = route.target.internetGatewayId;
            } else if (route.target.type === "NatGateway" && route.target.natGatewayId) {
              routeProps.natGatewayId = route.target.natGatewayId;
            }
          }
          new ec2.CfnRoute(this, `CustomRoute${idx}`, routeProps);
        });
      }
    }

    this.exportOutput("VpcId", this.vpc.vpcId);
    this.exportOutput("InternetGatewayId", (this.vpc as ec2.Vpc).internetGatewayId || "IGW not available");
    this.vpc.publicSubnets.forEach((subnet, idx) => {
      this.exportOutput(`PublicSubnet${idx + 1}RouteTableId`, subnet.routeTable.routeTableId);
    });
  }

  private mapSubnetType(type: string): ec2.SubnetType {
    switch (type.toUpperCase()) {
      case "PUBLIC": return ec2.SubnetType.PUBLIC;
      case "PRIVATE_WITH_EGRESS": return ec2.SubnetType.PRIVATE_WITH_EGRESS;
      case "PRIVATE_ISOLATED": return ec2.SubnetType.PRIVATE_ISOLATED;
      default: throw new Error(`Invalid subnet type: ${type}`);
    }
  }
}
