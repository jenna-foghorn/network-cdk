export interface BaseStackConfig {
  Name: string;
}

export interface VpcStackConfig extends BaseStackConfig {
  useExistingVpc: boolean;
  vpcId?: string;
  routeTableIds?: string[];
  cidr?: string;
  maxAzs?: number;
  natGateways?: number;
  natGatewaySubnetLayer?: string;
  subnetConfiguration?: { cidrMask: number; name: string; subnetType: string }[];
  routes?: { destination: string; target: RouteTarget }[];
}

interface RouteTarget {
  type: "InternetGateway" | "NatGateway" | "TransitGateway";
  internetGatewayId?: string;
  natGatewayId?: string;
  transitGatewayId?: string;
}

export interface TransitGatewayConfig extends BaseStackConfig {
  amazonSideAsn?: number;
  sharedWithAccounts?: string[];
  vpcAttachments?: { vpcId: string; subnetIds: string[]; name?: string }[];
}

export interface AttachTransitGatewayConfig extends BaseStackConfig {
  transitGatewayId: string;
  vpcAttachments: { name: string; vpcId: string; subnetIds: string[] }[];
}

export interface RouteStackConfig extends BaseStackConfig {
  routes: { routeTableIds: string[]; destination: string; target: RouteTarget }[];
}
