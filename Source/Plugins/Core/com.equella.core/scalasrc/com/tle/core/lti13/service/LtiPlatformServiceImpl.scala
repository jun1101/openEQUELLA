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

package com.tle.core.lti13.service

import com.tle.beans.lti.LtiPlatform
import com.tle.core.guice.Bind
import com.tle.core.lti13.bean.LtiPlatformBean
import com.tle.core.lti13.bean.LtiPlatformBean.populatePlatform
import com.tle.core.lti13.dao.LtiPlatformDAO
import org.springframework.transaction.annotation.Transactional
import com.tle.common.usermanagement.user.CurrentUser
import org.slf4j.{Logger, LoggerFactory}
import java.time.Instant
import javax.inject.{Inject, Singleton}
import scala.jdk.CollectionConverters._

@Singleton
@Bind(classOf[LtiPlatformService])
class LtiPlatformServiceImpl extends LtiPlatformService {
  @Inject var lti13Dao: LtiPlatformDAO = _

  private var logger: Logger            = LoggerFactory.getLogger(classOf[LtiPlatformServiceImpl])
  private def log(action: String): Unit = logger.info(s"User ${CurrentUser.getUserID} $action")

  override def getByPlatformID(platformID: String): Option[LtiPlatformBean] =
    lti13Dao.getByPlatformId(platformID).map(LtiPlatformBean.apply)

  override def getAll: List[LtiPlatformBean] =
    lti13Dao.enumerateAll.asScala.map(LtiPlatformBean.apply).toList

  @Transactional
  override def create(bean: LtiPlatformBean): String = {
    log(s"creates LTI platform by ${bean.platformId}")

    val newPlatform = populatePlatform(new LtiPlatform, bean)
    newPlatform.dateCreated = Instant.now
    newPlatform.createdBy = CurrentUser.getUserID
    lti13Dao.save(newPlatform)

    newPlatform.platformId
  }

  @Transactional
  override def update(bean: LtiPlatformBean): Option[String] = {
    val id = bean.platformId
    log(s"updates LTI platform - $id")

    lti13Dao
      .getByPlatformId(id)
      .map(platform => {
        platform.dateLastModified = Instant.now
        platform.lastModifiedBy = CurrentUser.getUserID
        lti13Dao.update(populatePlatform(platform, bean))
        id
      })
  }

  @Transactional
  override def delete(platFormId: String): Option[Unit] = {
    log(s"Deletes LTI platform - $platFormId")

    lti13Dao
      .getByPlatformId(platFormId)
      .map(lti13Dao.delete)
  }
}
