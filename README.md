# AWS Networking CDK Project - Transit Gateway Hub & Spoke

This repository provides an AWS CDK (TypeScript) implementation for deploying a **Transit Gateway (TGW) Hub & Spoke architecture**, enabling centralized networking across multiple AWS accounts.

## Features

- **Flexible VPC Support**: Create a new VPC or use an existing one (required per config).
- **Multi-Account TGW Hub**: Deploy a TGW hub in a networking account and share it via AWS RAM.
- **Spoke VPC Attachments**: Automatically attach VPCs from spoke accounts to the TGW hub.
- **External Routing**: Add custom routes to VPC route tables (e.g., TGW, NAT Gateway, Internet Gateway).
- **Modular Configuration**: One JSON config file per account/environment (e.g., `config/networking.json`, `config/staging.json`).
- **Tested Stacks**: Unit tests with snapshot validation for all stacks.

## Project Structure

| File/Path                                                                | Description                          |
| ------------------------------------------------------------------------ | ------------------------------------ |
| [`bin/app.ts`](./bin/app.ts)                                             | Main CDK entry point                 |
| [`lib/vpc-stack.ts`](./lib/vpc-stack.ts)                                 | Manages VPC (new or existing)        |
| [`lib/tgw-stack.ts`](./lib/tgw-stack.ts)                                 | Deploys the TGW hub                  |
| [`lib/attach-tgw-stack.ts`](./lib/attach-tgw-stack.ts)                   | Attaches spoke VPCs to the TGW       |
| [`lib/route-stack.ts`](./lib/route-stack.ts)                             | Adds external routes to route tables |
| [`lib/template/stack/base-stack.ts`](./lib/template/stack/base-stack.ts) | Base stack with common functionality |
| [`lib/template/app-context.ts`](./lib/template/app-context.ts)           | Loads configuration files            |
| [`config/networking.json`](./config/networking.json)                     | Networking account config example    |
| [`config/staging.json`](./config/staging.json)                           | Spoke account config example         |
| [`test/*.test.ts`](./test/)                                              | Unit tests for each stack            |

## Using This Repo

| Action      | Location  | Example                                                       |
| ----------- | --------- | ------------------------------------------------------------- |
| Add stack   | `lib/`    | [lib/tgw-stack.ts](./lib/tgw-stack.ts)                        |
| Add test    | `test/`   | [test/tgw-stack.test.ts](./test/tgw-stack.test.ts)            |
| Add configs | `config/` | A json file per account/region, all stacks should be optional |

## Configure AWS Credentials

Set up AWS credentials in `~/.aws/credentials`:

```bash
[InfraDeveloper]
aws_access_key_id = XXXXXXX
aws_secret_access_key = XXXXXX
And in ~/.aws/config:
```

And in `~/.aws/config`:

```bash
[profile InfraDeveloper]
region = us-east-1
output = json
Use the profile with commands:
```

Use the profile with commands:

```bash
APP_CONFIG=config/networking.json npx cdk synth --profile InfraDeveloper
```

Alternatively, use environment variables:

```bash
export AWS_ACCESS_KEY_ID=XXXXXXX
export AWS_SECRET_ACCESS_KEY=XXXXXX
export AWS_DEFAULT_REGION=us-east-1
```

## Configuration

Each environment/account requires a JSON config file in config/. The vpc stack is required, while others are optional.

VPC Configuration (Required)

- New VPC:

```json
"vpc": {
  "Name": "VpcStack",
  "cidr": "10.100.0.0/16",
  "maxAzs": 2,
  "natGateways": 1,
  "natGatewaySubnetLayer": "protected",
  "subnetConfiguration": [
    { "cidrMask": 24, "name": "public", "subnetType": "PUBLIC" },
    { "cidrMask": 24, "name": "private", "subnetType": "PRIVATE_WITH_EGRESS" }
  ],
  "useExistingVpc": false
}
```

- Existing VPC:

```json
"vpc": {
  "useExistingVpc": true,
  "vpcId": "vpc-0abcd1234efgh5678",
  "routeTableIds": ["rtb-0123456789abcdef0", "rtb-0fedcba9876543210"]
}
```

- `routeTableIds`: Specifies route tables for use in externalRoutes.

## TGW Hub (Networking Account)

Deploys and shares the TGW.

```json
"transitGateway": {
  "Name": "TransitGatewayStack",
  "sharedWithAccounts": ["123456789012"],
  "amazonSideAsn": 64512,
  "autoAcceptSharedAttachments": "enable",
  "defaultRouteTableAssociation": "enable",
  "defaultRouteTablePropagation": "enable"
}
```

#### Settings:

- `defaultRouteTableAssociation: "enable"`: Auto-associates new attachments with the TGW default route table.
- `defaultRouteTablePropagation: "enable"`: Auto-propagates routes from attached VPCs to the default route table.
- Set to "disable" for custom route table management.

## Attach Spoke VPC (Spoke Account)

Attaches a VPC to the TGW.

```json
// Staging
"attachTransitGateway": {
  "Name": "AttachTransitGatewayStack",
  "transitGatewayId": "tgw-12345678",
  "vpcAttachments": [
    {
      "name": "StagingVpc",
      "vpcId": "vpc-0321af1a8664fc2df",
      "subnetIds": ["subnet-0bc03757a24b783f7", "subnet-033fbd5cf3b994303", "subnet-08e671ff1e850f6fe"]
    }
  ]
}

// Networking
"attachTransitGateway": {
  "Name": "AttachTransitGatewayStack",
  "transitGatewayId": "tgw-12345678",
  "vpcAttachments": [
    {
      "name": "NetworkingVpc",
      "vpcId": "vpc-002dc66fa58d4ee6e",
      "subnetIds": ["subnet-0b1b244f1cd6c429b", "subnet-0c78517cbb1b52cf4", "subnet-0cce9a5ffe9472fb4"]
    }
  ]
}
```

## External Routes

Adds routes specific route tables.

```json
// Staging (Networking CIDR)
"externalRoutes": {
  "Name": "RoutesStack",
  "routes": [
    {
      "routeTableIds": ["rtb-0e4a92c039076d9bb", "rtb-099bd0d0b206f9715", "rtb-0ed58fd59d700c673"],
      "destination": "172.21.0.0/16",
      "target": { "type": "TransitGateway", "transitGatewayId": "tgw-12345678" }
    }
  ]
}

// Networking (Staging CIDR)
"externalRoutes": {
  "Name": "RoutesStack",
  "routes": [
    {
      "routeTableIds": ["rtb-07c71968f0b354746", "rtb-0a9df4cd9ed04571b", "rtb-0beac1c62c9b218d8"],
      "destination": "172.20.0.0/16",
      "target": { "type": "TransitGateway", "transitGatewayId": "tgw-12345678" }
    }
  ]
}
```

- Supported `target.type`: "TransitGateway", "InternetGateway", "NatGateway".

## Resource Access Manager (RAM) Setup

AWS CDK cannot auto-accept RAM shares due to CloudFormation limitations. Perform these steps manually:

1. Share the TGW:
   - Deploy TransitGatewayStack in the networking account with sharedWithAccounts.
   - Note the TransitGatewayId from outputs.
1. Accept in Spoke Account:

CLI:

```bash
aws ram accept-resource-share-invitation --resource-share-invitation-arn <ARN>
```

Console:

- Log into the spoke account.
- Go to **_Resource Access Manager_** > **_Shared with me_** > **_Resource shares_**.
- Accept the invitation.

## Usage

### Build

```bash
npm run build
```

### List Stacks

```bash
APP_CONFIG=config/networking.json npx cdk ls
```

### Test

Run tests with Jest:

```bash
npm run test
```

Update snapshots:

```bash
npm run test -- -u
```

Tests use the `APP_CONFIG` set in beforeEach (e.g., [config/networking.json](./config/networking.json)).

### Diffs

```bash
APP_CONFIG=config/networking.json npx cdk diff
```

### Deploy

1. Bootstrap:
   ```bash
   APP_CONFIG=config/networking.json npx cdk bootstrap aws://179783686247/us-east-1
   ```
1. Synthesize:
   ```bash
   APP_CONFIG=config/networking.json npx cdk synth --no-staging --output=cdk.out
   ```
1. Deploy:
   ```bash
   APP_CONFIG=config/networking.json npx cdk deploy --rollback
   ```
   - :white_check_mark: Copy the `TransitGatewayId` output for spoke configs.

### Debugging

- Inspect CloudFormation:
  ```bash
  APP_CONFIG=config/networking.json npx cdk synth > template.yaml
  ```
- Check Stack Status:
  ```bash
  aws cloudformation describe-stacks --stack-name TransitGatewayStack
  ```

---

---

## Development Standards

### CommitLint

#### Enable

```
npm run commitlint
```

#### Usage

```
git add README.md
git commit -m "docs: add polished README"
git push
```

#### To bypass CommitLint

```
git commit --no-verify -a -m "whatever message you want"
```

#### To disable CommitLint

```
rm .husky/commit-msg
```

Or disable by removing commitlint from [package.json](./package.json)

```
"scripts": {
  "commitlint": "npx commitlint --last --verbose" // REMOVE this line if not needed
}
```

#### CommitLint - Usage Table

| Type     | When to use                                  |
| -------- | -------------------------------------------- |
| feat     | New feature                                  |
| fix      | Bug fix                                      |
| chore    | Build/maintenance, no user-facing change     |
| docs     | Documentation change                         |
| refactor | Code refactor, no feature/bug fix            |
| test     | Adding/adjusting tests                       |
| ci       | Changes to CI/CD workflows                   |
| style    | Formatting, lint fixes, no code logic change |
