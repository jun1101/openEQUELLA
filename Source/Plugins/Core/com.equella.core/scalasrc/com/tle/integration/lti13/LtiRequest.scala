package com.tle.integration.lti13

import com.auth0.jwt.interfaces.DecodedJWT
import com.tle.integration.lti13.Lti13Claims.CUSTOM_PARAMETERS
import cats.implicits._

object LtiMessageType extends Enumeration {
  val LtiDeepLinkingRequest, LtiResourceLinkRequest = Value
}

trait LtiRequest {
  val messageType: LtiMessageType.Value
}

/**
  * Data structure for LTI 1.3 deep linking request.
  *
  * @param deepLinkingSettings Deep Linking settings extracted from claim 'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'
  * @param customParams Optional Custom parameters extracted from claim 'https://purl.imsglobal.org/spec/lti/claim/custom'
  */
case class LtiDeepLinkingRequest(deepLinkingSettings: DeepLinkingSettings,
                                 customParams: Option[Map[String, String]])
    extends LtiRequest {
  override val messageType: LtiMessageType.Value = LtiMessageType.LtiDeepLinkingRequest
}

object LtiDeepLinkingRequest {

  /**
    * Extract custom params from the provided decoded JWT. Values of custom params must be present as String
    * by the LSM platform, so discard those non-String values.
    *
    * @param decodedJWT Decoded JWT which provides the claim of custom params.
    * @return A key-value map for custom params, or `None` if no such a claim available.
    */
  def getCustomParamsFromClaim(decodedJWT: DecodedJWT): Option[Map[String, String]] = {
    getClaimAsMap(decodedJWT, CUSTOM_PARAMETERS)
      .map(
        _.collect {
          case (k, v) if v.isInstanceOf[String] => (k, v.asInstanceOf[String])
        }
      )
  }
}

/**
  * Data structure for LTI 1.3 resource link request.
  *
  * todo: Update the structure as needed. Maybe need another case class for the resource link. Check claim "https://purl.imsglobal.org/spec/lti/claim/resource_link".
  */
case class LtiResourceLinkRequest(targetLinkUri: String) extends LtiRequest {
  override val messageType: LtiMessageType.Value = LtiMessageType.LtiResourceLinkRequest
}
