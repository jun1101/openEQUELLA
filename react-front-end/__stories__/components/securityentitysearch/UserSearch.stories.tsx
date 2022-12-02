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
import { action } from "@storybook/addon-actions";
import { Meta, Story } from "@storybook/react";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import * as RSET from "fp-ts/ReadonlySet";
import * as S from "fp-ts/string";
import * as React from "react";
import * as GroupModuleMock from "../../../__mocks__/GroupModule.mock";
import * as UserModuleMock from "../../../__mocks__/UserModule.mock";
import UserSearch, {
  UserSearchProps,
} from "../../../tsrc/components/securityentitysearch/UserSearch";
import { eqUserById } from "../../../tsrc/modules/UserModule";

export default {
  title: "component/SecurityEntitySearch/UserSearch",
  component: UserSearch,
  argTypes: {
    onChange: {
      action: "onChange called",
    },
  },
} as Meta<UserSearchProps>;

export const Default: Story<UserSearchProps> = (args) => (
  <UserSearch {...args} />
);
Default.args = {
  selections: RSET.empty,
  listHeight: 150,
  search: UserModuleMock.listUsers,
};

export const GroupFilter: Story<UserSearchProps> = (args) => (
  <UserSearch {...args} />
);
GroupFilter.args = {
  ...Default.args,
  search: UserModuleMock.listUsers,
  groupFilter: new Set(GroupModuleMock.groups.map(({ id }) => id)),
  resolveGroupsProvider: GroupModuleMock.resolveGroups,
};

export const GroupFilterWithFailedGroupsResolver: Story<UserSearchProps> = (
  args
) => <UserSearch {...args} />;
GroupFilterWithFailedGroupsResolver.args = {
  ...GroupFilter.args,
  resolveGroupsProvider: async () => {
    throw Error("test");
  },
};

export const MultiSelection: Story<UserSearchProps> = (args) => (
  <UserSearch {...args} />
);
MultiSelection.args = {
  ...Default.args,
  selections: pipe(
    UserModuleMock.users,
    A.filter((user) => pipe(user.username, S.includes("user"))),
    RSET.fromReadonlyArray(eqUserById)
  ),
  enableMultiSelection: true,
};

export const GroupFilterEditable: Story<UserSearchProps> = (args) => (
  <UserSearch {...args} />
);
GroupFilterEditable.args = {
  ...Default.args,
  search: UserModuleMock.listUsers,
  groupFilterEditable: true,
  groupFilter: RSET.empty,
  groupSearch: GroupModuleMock.listGroups,
  resolveGroupsProvider: GroupModuleMock.resolveGroups,
};

export const SelectAndCancelButton: Story<UserSearchProps> = (args) => (
  <UserSearch {...args} />
);
SelectAndCancelButton.args = {
  ...Default.args,
  selectButton: { onClick: action("select button onClick triggered") },
};
SelectAndCancelButton.argTypes = {
  onCancel: { action: "onCancel triggered" },
};

export const SelectAllAndClearAllButton: Story<UserSearchProps> = (args) => (
  <UserSearch {...args} />
);
SelectAllAndClearAllButton.args = {
  ...Default.args,
};
SelectAllAndClearAllButton.argTypes = {
  onSelectAll: { action: "onSelectAll triggered" },
  onClearAll: { action: "onClearAll triggered" },
};
