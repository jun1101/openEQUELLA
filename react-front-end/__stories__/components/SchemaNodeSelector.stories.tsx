/*
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0, (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import SchemaNodeSelector, {
  SchemaNodeSelectorProps,
} from "../../tsrc/settings/SchemaNodeSelector";
import { testSchema } from "../../__mocks__/schemaSelectorDataMock";

export default {
  title: "SchemaNodeSelector",
  component: SchemaNodeSelector,
  argTypes: { setSelectedNode: { action: "setSelectedNode" } },
} as Meta<SchemaNodeSelectorProps>;

export const SchemaNodeSelectorComponent: StoryFn<SchemaNodeSelectorProps> = (
  args,
) => <SchemaNodeSelector {...args} />;
SchemaNodeSelectorComponent.args = {
  tree: testSchema,
  expandControls: false,
};
