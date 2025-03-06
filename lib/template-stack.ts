import { AppContext } from "./template/app-context";
import * as base from "./template/stack/base-stack";

export class TemplateStack extends base.BaseStack {
  constructor(appContext: AppContext, stackConfig: any) {
    super(appContext, stackConfig);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'Eh2IcebergQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // this.exportOutput("test_key", "test_value")
  }
}
