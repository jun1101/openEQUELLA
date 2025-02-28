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

package com.tle.upgrade.upgraders;

import com.tle.upgrade.UpgradeResult;
import java.io.File;

/** @author Aaron */
@SuppressWarnings("nls")
public class CreateUpgraderLog4j extends AbstractUpgrader {
  @Override
  public String getId() {
    return "CreateUpgraderLog4j";
  }

  @Override
  public boolean isBackwardsCompatible() {
    return true;
  }

  @Override
  public void upgrade(UpgradeResult result, File tleInstallDir) throws Exception {
    final File out = new File(tleInstallDir, "manager/upgrader-log4j.yaml");
    if (!out.exists()) {
      copyResource("upgrader-log4j.yaml", out);
    }
  }
}
