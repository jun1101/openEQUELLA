package com.tle.integration.lti13

/**
  * Provide the support for parsing a custom username claim.
  *
  * Since an LTI claim can be hierarchical and have multiple paths, the custom username
  * claim configured in a LTI Platform must be provided in the format of bracket notation.
  * That is, each path of the claim must be wrapped by a pair of square brackets.
  */
object Lti13UsernameClaimParser {

  /**
    * Regex to extract a list of chars that does not contain a '[' nor ']' from
    * a pair of square brackets.
    *
    * Examples:
    * <li> [https://lti13.org][moodle][ID] -> "https://lti13.org", "moodle", "ID"
    * <li> [https://lti13.org][moodle[ID] -> "https://lti13.org", "ID"
    * <li> https://lti13.org][moodle][ID] -> "moodle", "ID
    * <li> [][https://lti13.org][moodle][ID][] -> "https://lti13.org", "moodle", "ID"
    */
  private val USERNAME_CLAIM_REGEX = """\[([^\[\]]+?)\]""".r

  private val BRACKETS_LENGTH = 2 // for []

  /**
    * Function to verify whether the custom username claim configured in a LTI 1.3 Platform
    * is valid or not, based on the format of bracket notation.
    *
    * An regular expression is used to extract all the paths from the brackets into an array.
    * The paths are then verified by summing the length of each (including their brackets) and
    * comparing with the length of the original claim. While an equal result means the verification
    * succeeds and returns the array, an unequal result indicates that the claim must not be
    * constructed properly in the format of bracket notation and results in a [[PlatformDetailsError]].
    *
    * Examples:
    * <li> [https://lti13.org][moodle][ID] -> Array("https://lti13.org", "moodle", "ID)
    * <li> [https://lti13.org][moodle[ID] -> PlatformDetailsError
    * <li> ][https://lti13.org][moodle][ID] -> PlatformDetailsError
    *
    * @param claim The LTI custom user name claim to be verified.
    * @return Either an array of verified paths or an error
    */
  def parse(claim: String): Either[PlatformDetailsError, Option[Array[String]]] = {
    val paths = USERNAME_CLAIM_REGEX.findAllMatchIn(claim).toArray

    Either.cond(
      paths.map(_.matched.length).sum == claim.length, // including brackets
      Option(paths.map(_.group(1))), // Only need to content of the brackets
      PlatformDetailsError(s"Syntax error in claim $claim")
    )
  }
}
