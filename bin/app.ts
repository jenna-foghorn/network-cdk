#!/usr/bin/env node
import "source-map-support/register";
import { TemplateStack } from "../lib/template-stack.ts";
import { AppContext } from "../lib/template/app-context";

const appContext = new AppContext({
  appConfigFileKey: "APP_CONFIG",
});

// Deploy TemplateStack
new TemplateStack(appContext, appContext.appConfig.Stack.Template);
