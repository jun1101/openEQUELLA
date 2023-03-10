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

package com.tle.integration

import com.auth0.jwt.interfaces.DecodedJWT

import java.security.SecureRandom

package object lti13 {
  private val secureRandom = SecureRandom.getInstanceStrong

  /**
    * Helper function for dealing with params sent the servlet endpoint. On the expectation that
    * all the params are a one-to-one value - so navigates around the need to handle the potential
    * list.
    *
    * @param params a collection of params received at one of the servlet request handlers.
    * @return a function which has wrapped over the `params` and can now be used simply with the
    *         name of an expected parameter. The function will return `None` if the param is not
    *         present
    */
  def getParam(params: Map[String, Array[String]]): String => Option[String] =
    (param: String) => params.get(param).flatMap(_.headOption)

  /**
    * From the provided decoded JWT return the specified claim which is expected to be a string.
    *
    * @param jwt   a token containing the claim
    * @param claim name of a string based claim
    * @return If available will return the string value of the claim, or `None`
    */
  def getClaim(jwt: DecodedJWT, claim: String): Option[String] =
    Option(jwt.getClaim(claim)).flatMap(c => Option(c.asString()))

  /**
    * Given a decoded JWT will return a partially applied function which can then receive the name
    * of a claim and return the value as a `String` or `None` if not present in the claims.
    *
    * @param jwt a token containing claims which will be wrapped in the returned function
    * @return a function which given the name of a claim will optionally return its value.
    */
  def getClaim(jwt: DecodedJWT): String => Option[String] =
    (claim: String) => Option(jwt.getClaim(claim)).flatMap(c => Option(c.asString()))

  /**
    * Generates a string of random bytes represented as hexadecimal values.
    *
    * @param length number of random bytes
    * @return a string which is twice the length of `length` with each two characters representing
    *         one byte
    */
  def generateRandomHexString(length: Int): String =
    Range(0, length).map(_ => "%02x".format(secureRandom.nextInt(255))).mkString
}
