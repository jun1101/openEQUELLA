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
import { boolean, date } from "@storybook/addon-knobs";
import { DateDisplay } from "../../tsrc/components/Date";

export default {
  title: "DateDisplay",
  component: DateDisplay,
};

function dateKnob(name: string) {
  const timestamp = date(name);
  return new Date(timestamp);
}

export const dateDisplay = () => (
  <DateDisplay
    displayRelative={boolean("Relative date", false)}
    date={dateKnob("Date")}
  />
);
