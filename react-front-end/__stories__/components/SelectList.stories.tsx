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
import { Meta, Story } from "@storybook/react";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { SelectList, SelectListProps } from "../../tsrc/components/SelectList";
import * as M from "fp-ts/Map";

export default {
  title: "Component/SelectList",
  component: SelectList,
  argTypes: {
    onSelect: {
      action: "onSelect called",
    },
  },
} as Meta<SelectListProps>;

const options = new Map([
  ["first", "Here's one"],
  ["second", "And another"],
  ["third", "And a third option"],
]);

export const Basic: Story<SelectListProps> = (args) => <SelectList {...args} />;
Basic.args = {
  options,
};

export const WithCustomContent: Story<SelectListProps> = (args) => (
  <SelectList {...args} />
);
WithCustomContent.args = {
  options: pipe(
    options,
    M.map((value) => <p>{value + " extra content"}</p>),
  ),
};
