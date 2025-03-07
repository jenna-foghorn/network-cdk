# Welcome to your Networking CDK TypeScript project

This repository provides an **AWS CDK TypeScript** implementation to deploy **Networking**.

The [cdk.json](./cdk.json) file tells the CDK Toolkit how to execute your app.

## Using this repo

Add stacks to `lib/` following the [lib/template-stack.ts](./lib/template-stack.ts) example

Update [bin/app.ts](./bin/app.ts) to add stacks to cdk app.

Add tests to `test/` following the [test/template-stack.test.ts](./test/template-stack.test.ts) example to run snapshot tests of resulting cloudformation templates.

Add stack configurations to `config/` following the example in [config/test.json](./config/test.json)

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npm run test -- -u` update test snapshots
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
- `npm run lint` lint code
- `npm run lint:fix` lint and fix code
- `npm run commitlint` Lint last commit message


## Features

- Transit Gateway Hub and spoke


## :file_folder: Project Structure

| File | Description |
|------|-------------|
| [bin/app.ts](./bin/app.ts)                                                            | Main CDK entry point |
| [lib/template-stack.ts](./lib/template-stack.ts)                                      | Template stack (Networking Stack) |
| [lib/template/app-context.ts](./lib/template/app-context.ts)                          | Handles config loading |
| [lib/template/app-donfig.ts](./lib/template/app-donfig.ts)                            | Defines project-wide settings |
| [lib/template/common/common-guardian.ts](./lib/template/common/common-guardian.ts)    | Handles S3 bucket creation |
| [lib/template/common/common-helper.ts](./lib/template/common/common-helper.ts)        | Handles parameter storage and naming |
| [lib/template/stack/base-stack.ts](./lib/template/stack/base-stack.ts)                | Base stack with standard functionality |
| [test/template-stack.test.ts](./test/template-stack.test.ts)                          | Unit tests |
| [config/test.json](./config/test.json)                                                | Project-specific configurations |
| [cdk.json](./cdk.json)                                                                | CDK configuration |
| [package.json](./package.json)                                                        | Node.js dependencies |
| [tsconfig.json](./tsconfig.json)                                                      | TypeScript configuration |
| [README.md](./README.md)                                                              | Project documentation  |



## :gear: Configuration

Modify [config/test.json](./config/test.json) to customize the deployment:

```json
{
  "Project": {
    "Name": "NetworkingProject",
    "Stage": "Staging",
    "Product": "APM",
    "Account": "111111111111",
    "Region": "us-east-1"
  },
  "Stack": {
    "Template": {
      "Name": "NetworkingStack"
    }
  }
}
```

Describes [config/test.json](./config/test.json) settings:
| Configuration | Description |
|---------------|-------------|
|  |  |


## Deployment Steps

### 1. Initialize AWS CDK Project
```sh
cd networking # GitHub repo name
cdk init app --language typescript
```

### 2. Install Dependencies
Run the following to install dependencies:
```sh
npm install
```

### 3. Build the CDK Project
```sh
npm run build
```

### 4. Synthesize CloudFormation Template
```sh
npx cdk synth
```

### 5. Deploy the Stack
```sh
npx cdk deploy
```

### 6.  After deployment, outputs will display:
-
-


## :arrows_counterclockwise: Updating the Stack

If you modify [config/test.json](./config/test.json), **rebuild & redeploy**:
```sh
npm run build
npx cdk deploy
```


## Running Tests

Ensure all resources are correctly provisioned:
```sh
npm run test
```

This runs unit tests that verify:
- **CloudFormation template snapshots** remain unchanged.

## :x: Destroying the Stack

To remove all AWS resources:
```sh
npx cdk destroy
```



## :construction: Troubleshooting

Common Issues & How to Fix Them.

| Issue | Cause | Solution |
|-------|-------|----------|
|  |  |  |




### 1. Debugging CloudFormation Errors

To inspect the generated CloudFormation template:
```sh
npx cdk synth
```
To view CloudFormation logs:
```sh
aws cloudformation describe-stacks --stack-name NetworkingStack
```
---


# AWS Networking CDK - Transit Gateway Hub & Spoke

This repository provides an AWS CDK TypeScript implementation to deploy networking resources using a Transit Gateway Hub & Spoke architecture.

The [cdk.json](./cdk.json) file tells the CDK Toolkit how to execute your app.

## Using This Repository

- Add stacks to `lib/` following the [lib/template-stack.ts](./lib/template-stack.ts) example.
- Update [bin/app.ts](./bin/app.ts) to add stacks to the CDK app.
- Add tests to `test/` following the [test/template-stack.test.ts](./test/template-stack.test.ts) example.
- Modify configurations in `config/` following the example in [config/hub.json](./config/hub.json) and [config/spoke\_1.json](./config/spoke_1.json).
  - where 1 in `spoke_1.json` is the account number?

## Features

- Deploys AWS Transit Gateway in a Hub & Spoke model
- Supports Multi-Account AWS environments
- Enables automatic VPC attachments across accounts
- Manages Route Table Associations
- Easily extendable with additional networking resources

## Project Structure

| File                                                                               | Description                            |
| ---------------------------------------------------------------------------------- | -------------------------------------- |
| [bin/app.ts](./bin/app.ts)                                                         | Main CDK entry point                   |
| [lib/template-stack.ts](./lib/template-stack.ts)                                   | Template stack (Networking Stack)      |
| [lib/template/app-context.ts](./lib/template/app-context.ts)                       | Handles config loading                 |
| [lib/template/app-config.ts](./lib/template/app-config.ts)                         | Defines project-wide settings          |
| [lib/template/common/common-guardian.ts](./lib/template/common/common-guardian.ts) | Handles S3 bucket creation             |
| [lib/template/common/common-helper.ts](./lib/template/common/common-helper.ts)     | Handles parameter storage and naming   |
| [lib/template/stack/base-stack.ts](./lib/template/stack/base-stack.ts)             | Base stack with standard functionality |
| [lib/transit-gateway-stack.ts](./lib/transit-gateway-stack.ts)                     | Deploys Transit Gateway (Hub)          |
| [lib/accept-transit-gateway-stack.ts](./lib/accept-transit-gateway-stack.ts)       | Attaches Spoke VPCs to Transit Gateway |
| [config/hub.json](./config/hub.json)                                               | Configuration for the Hub Account      |
| [config/spoke\_1.json](./config/spoke_1.json)                                      | Configuration for a Spoke Account      |
| [test/template-stack.test.ts](./test/template-stack.test.ts)                       | Unit tests                             |
| [cdk.json](./cdk.json)                                                             | CDK configuration                      |
| [package.json](./package.json)                                                     | Node.js dependencies                   |
| [tsconfig.json](./tsconfig.json)                                                   | TypeScript configuration               |
| [README.md](./README.md)                                                           | Project documentation                  |

## Configuration

### Hub Account

Defines the Transit Gateway and its VPC Attachments, and uses [config/hub.json](./config/hub.json) for configuration.


### Spoke Account(s)

Defines the VPC Attachments in a Spoke AWS Account, and uses [config/spoke_1.json](./config/spoke_1.json) for configuration.



## Deployment Steps

### Install Dependencies

```sh
npm install
```

### Build the CDK Project

```sh
npm run build
```

### Deploy the Hub Account (Creates Transit Gateway)

```sh
APP_CONFIG=config/hub.json npx cdk deploy TransitGatewayStack
```

#### Locating the Transit Gateway ID
```sh
aws cloudformation describe-stacks --stack-name TransitGatewayStack --query "Stacks[0].Outputs[?OutputKey=='TransitGatewayId'].OutputValue" --output text
```

Copy the `TransitGatewayID` and update [config/spoke_1.json](./config/spoke_1.json)


### Deploy the Spoke Account (Attaches VPC to Transit Gateway)

```sh
APP_CONFIG=config/spoke_1.json npx cdk deploy AcceptTransitGatewayStack
```

## Updating the Stack

If you modify [config/hub.json](./config/hub.json) or [config/spoke_1.json](./config/spoke_1.json), rebuild and redeploy:

```sh
npm run build
npx cdk deploy
```

## Running Tests

```sh
npm run test
```

## Destroying the Stack

```sh
npx cdk destroy
```

## Troubleshooting

| Issue                                   | Cause                         | Solution                                                     |
| --------------------------------------- | ----------------------------- | ------------------------------------------------------------ |
| CDK deployment fails                    | `APP_CONFIG` is not set       | Ensure you run `APP_CONFIG=config/hub.json npx cdk deploy`   |
| Transit Gateway Attachments not showing | Incorrect VPC/subnet IDs      | Check `config/spoke_1.json` and update `vpcId` & `subnetIds` |
| Networking issues                       | Route propagation not enabled | Verify route tables are properly configured                  |

## Debugging CloudFormation Errors

Inspect the generated CloudFormation template:

```sh
npx cdk synth
```

View CloudFormation logs:
```sh
aws cloudformation describe-stacks --stack-name TransitGatewayStack
```
