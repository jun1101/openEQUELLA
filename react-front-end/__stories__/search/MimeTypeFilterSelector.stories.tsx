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
import * as OEQ from "@openequella/rest-api-client";
import { Meta, StoryFn } from "@storybook/react";
import * as React from "react";
import { getMimeTypeFilters } from "../../__mocks__/MimeTypeFilter.mock";
import {
  MimeTypeFilterSelector,
  MimeTypeFilterSelectorProps,
} from "../../tsrc/search/components/MimeTypeFilterSelector";

export default {
  title: "Search/MimeTypeFilterSelector",
  component: MimeTypeFilterSelector,
  argTypes: {
    onChange: { action: "on select filters" },
  },
} as Meta<MimeTypeFilterSelectorProps>;

const mockedFilters: OEQ.SearchFilterSettings.MimeTypeFilter[] =
  getMimeTypeFilters;
const commonProps = {
  filters: mockedFilters,
};

export const NoFilterSelected: StoryFn<MimeTypeFilterSelectorProps> = (
  args,
) => <MimeTypeFilterSelector {...args} />;

NoFilterSelected.args = {
  value: [],
  ...commonProps,
};

export const FilterSelected: StoryFn<MimeTypeFilterSelectorProps> = (args) => (
  <MimeTypeFilterSelector {...args} />
);

FilterSelected.args = {
  value: mockedFilters,
  ...commonProps,
};
