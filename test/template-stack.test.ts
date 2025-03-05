import { Template } from "aws-cdk-lib/assertions";
import { TemplateStack } from "../lib/template-stack";
import { AppContext } from "../lib/template/app-context";

describe("TemplateStack", () => {

  beforeEach(() => {
    process.env["APP_CONFIG"] = "config/test.json";
  });

  test("matches the snapshot", () => {
    const appContext = new AppContext({
      appConfigFileKey: "APP_CONFIG",
    });

    const stack = new TemplateStack(
      appContext,
      appContext.appConfig.Stack.Template,
    );

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });

});
