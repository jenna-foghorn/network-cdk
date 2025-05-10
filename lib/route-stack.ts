import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AppContext } from "./template/app-context";
import { BaseStack } from "./template/stack/base-stack";
import { RouteStackConfig } from "./config-types";

export class RouteStack extends BaseStack {
  constructor(appContext: AppContext, stackConfig: RouteStackConfig) {
    super(appContext, stackConfig);

    const routes = stackConfig.routes || [];

    for (const route of routes) {
      const { routeTableIds, destination, target } = route;

      if (!routeTableIds || !Array.isArray(routeTableIds) || routeTableIds.length === 0) {
        console.warn("Skipping route: routeTableIds must be a non-empty array");
        continue;
      }
      if (!destination) {
        console.warn("Skipping route: missing destination");
        continue;
      }

      routeTableIds.forEach((routeTableId: string, idx: number) => {
        const routeProps: ec2.CfnRouteProps = {
          routeTableId,
          destinationCidRBlock: destination,
        };

        if (target) {
          switch (target.type) {
            case "InternetGateway":
              if (!target.internetGatewayId) {
                console.warn("Skipping route: internetGatewayId missing for InternetGateway target");
                return;
              }
              routeProps.gatewayId = target.internetGatewayId;
              break;
            case "NatGateway":
              if (!target.natGatewayId) {
                console.warn("Skipping route: natGatewayId missing for NatGateway target");
                return;
              }
              routeProps.natGatewayId = target.natGatewayId;
              break;
            case "TransitGateway":
              if (!target.transitGatewayId) {
                console.warn("Skipping route: transitGatewayId missing for TransitGateway target");
                return;
              }
              routeProps.transitGatewayId = target.transitGatewayId;
              break;
            default:
              console.warn(`Unsupported target type: ${target.type}`);
              return;
          }
        }

        new ec2.CfnRoute(
          this,
          `Route-${routeTableId.replace(/[^a-zA-Z0-9]/g, "")}-${destination.replace(/[^a-zA-Z0-9]/g, "")}-${idx + 1}`,
          routeProps
        );
      });
    }
  }
}
