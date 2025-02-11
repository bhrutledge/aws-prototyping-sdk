/*********************************************************************************************************************
 Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License").
 You may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ******************************************************************************************************************** */

import * as path from "path";
import * as fs from "fs-extra";
import { Component } from "projen";
import { TypeScriptProject } from "projen/lib/typescript";
import { ClientLanguage } from "../../languages";
import { generateClientCode } from "./utils";

/**
 * Configuration for the GeneratedTypescriptClient component
 */
export interface GeneratedTypescriptClientSourceCodeOptions {
  /**
   * Absolute path to the OpenAPI specification (spec.yaml)
   */
  readonly specPath: string;
}

/**
 * Generates the typescript client using OpenAPI Generator
 */
export class GeneratedTypescriptClientSourceCode extends Component {
  private options: GeneratedTypescriptClientSourceCodeOptions;

  constructor(
    project: TypeScriptProject,
    options: GeneratedTypescriptClientSourceCodeOptions
  ) {
    super(project);
    this.options = options;
  }

  /**
   * @inheritDoc
   */
  synthesize() {
    super.synthesize();

    // Generate the typescript client
    generateClientCode({
      generator: "typescript-fetch",
      specPath: this.options.specPath,
      outputPath: this.project.outdir,
      language: ClientLanguage.TYPESCRIPT,
      additionalProperties: {
        npmName: (this.project as TypeScriptProject).package.packageName,
        typescriptThreePlus: "true",
        useSingleParameter: "true",
        supportsES6: "true",
      },
    });

    // Write an index.ts which exposes the additional generated file OperationConfig.ts, which contains handler wrappers
    // and other generated code used by the construct.
    fs.writeFileSync(
      path.join(this.project.outdir, "src", "index.ts"),
      [
        "/* tslint:disable */",
        "/* eslint-disable */",
        "export * from './runtime';",
        "export * from './apis';",
        "export * from './models';",
        "export * from './apis/DefaultApi/OperationConfig';",
      ].join("\n")
    );
  }
}
