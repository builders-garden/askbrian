import { Request, Response } from "express";
import { HTTPError } from "ky";
import { getCastFromHash } from "../../utils/farcaster.js";
import { addToRepliesQueue } from "../../queues/index.js";
import { env } from "../../env.js";
import { Logger } from "../../utils/logger.js";

const logger = new Logger("nominationsHandler");

const regexPattern =
  /(?:@brianbot\s+\s+@\S+|@brianbot\s+|\s+@\S+\s+@brianbot|\s+@brianbot(?:\s+@\S+)?|@\S+\s+\s+@brianbot)\b/g;

const replyWithError = async (replyTo: string, text?: string) => {
  addToRepliesQueue({
    text: text || "There was an issue with your nomination. Please try again.",
    id: `replyTo-${replyTo}-${Date.now()}`,
    replyTo,
  });
};

const replyWithSuccess = async (
  replyTo: string,
  nominator: string,
  nominee: string,
  text?: string
) => {
  addToRepliesQueue({
    text:
      text ||
      `Thanks @${nominator}, you just asked to do this: @${nominee} frame.`,
    id: `replyTo-${replyTo}-${Date.now()}`,
    replyTo,
  });
};

export const nominationsHandler = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    logger.log(`new cast with @brianbot mention received.`);

    const { data } = body;

    if (!data) {
      logger.error(`no data received.`);
      return res.status(200).send({ status: "nok" });
    }

    const {
      parent_hash: parentHash,
      author,
      text,
      mentioned_profiles: mentionedProfiles,
      hash,
    } = data;

    const patternMatches: string[] = text.match(regexPattern);

    if (patternMatches === null) {
      logger.error(`no nomination pattern found. received text - ${text}`);
      return res.status(200).send({ status: "nok" });
    }

    const firstMatch = patternMatches[0];

    logger.log(`valid nomination pattern found - received text - ${text}`);
    logger.log(`working on first match => ${firstMatch}`);
    logger.log(
      `cast hash - ${hash} - parent hash - ${parentHash} - author - ${author.username}`
    );

    const originWallet =
      author.verified_addresses &&
      author.verified_addresses.eth_addresses &&
      author.verified_addresses.eth_addresses.length > 0
        ? author.verified_addresses?.eth_addresses[0]
        : author.custody_address;

    const brianbotFid = env.BRIANBOT_FARCASTER_FID;

    const notBotProfiles = mentionedProfiles.filter(
      (profile: { fid: number }) => profile.fid !== brianbotFid
    );

    if (notBotProfiles && notBotProfiles.length > 0) {
      // check if the user has mentioned a profile to nominate that is included in the match
      const patternWords = firstMatch.split(" ");
      const mentionedProfileUsernameInsidePattern = patternWords.find(
        (word) => word.startsWith("@") && word !== "@brianbot"
      );

      if (mentionedProfileUsernameInsidePattern) {
        // take mentioned profile from the mentionedProfiles array if the username matchers the mentionedProfileUsernameInsidePattern (without the "@"") or the username contains the mentionedProfileUsernameInsidePattern but ends with special characters like "." or "_" that are not included in the mentionedProfileUsernameInsidePattern
        const mentionedProfile = notBotProfiles.find(
          (profile: any) =>
            profile.username ===
              mentionedProfileUsernameInsidePattern.slice(1) ||
            (profile.username.includes(
              mentionedProfileUsernameInsidePattern.slice(1)
            ) &&
              (profile.username.endsWith(".") ||
                profile.username.endsWith("_") ||
                profile.username.endsWith("-") ||
                profile.username.endsWith("!") ||
                profile.username.endsWith("?") ||
                profile.username.endsWith("#") ||
                profile.username.endsWith("$")))
        );
        logger.log(
          `mentioned profile to nominate - ${mentionedProfile.username}`
        );
        const walletToNominate =
          mentionedProfile.verified_addresses.eth_addresses[0] ??
          mentionedProfile.custody_address;

        if (originWallet && walletToNominate) {
          //   const nominationResult = await createNomination(
          //     originWallet,
          //     walletToNominate,
          //     hash
          //   );
          //   if (nominationResult.ok === false) {
          //     if (nominationResult.status === 400) {
          //       replyWithError(hash, nominationResult.error);
          //     } else {
          //       replyWithError(hash);
          //     }
          //     return res.status(200).send({ status: "nok" });
          //   }
          //   replyWithSuccess(hash, author.username, mentionedProfile.username);
          //   return res.status(200).send({ status: "ok" });
          replyWithSuccess(hash, author.username, mentionedProfile.username);
          return res.status(200).send({ status: "ok" });
        }
        logger.error(`no valid profiles mentioned.`);
        replyWithError(hash);
        return res.status(200).send({ status: "nok" });
      }
    }

    if (parentHash) {
      // check the parent cast and get its caster as the nominated user
      const parentCast = await getCastFromHash(parentHash);

      if (!parentCast) {
        logger.error(`parent cast [${parentHash}] not found.`);
        replyWithError(hash);
        return res.status(200).send({ status: "nok" });
      }

      const walletToNominate =
        parentCast.cast.author.verified_addresses?.eth_addresses[0];

      if (walletToNominate && originWallet) {
        // const nominationResult = await createNomination(
        //   originWallet,
        //   walletToNominate,
        //   hash
        // );
        // if (nominationResult.ok === false) {
        //   if (nominationResult.status === 400) {
        //     replyWithError(hash, nominationResult.error);
        //   } else {
        //     replyWithError(hash);
        //   }
        //   return res.status(200).send({ status: "nok" });
        // }
        replyWithSuccess(
          hash,
          author.username,
          parentCast.cast.author.username ?? ""
        );
        return res.status(200).send({ status: "ok" });
      }

      logger.error(`no valid profiles mentioned.`);
      replyWithError(hash);
      return res.status(200).send({ status: "nok" });
    }

    replyWithError(hash);
    return res.status(200).send({ status: "nok" });
  } catch (error) {
    if (error instanceof HTTPError && error.name === "HTTPError") {
      const errorJson = await error.response.json();
      console.error(
        `[/webhooks/nominations] [${new Date().toISOString()}] - error sending prompt to brian: ${
          errorJson.error
        }.`
      );
    }
    if (error instanceof Error) {
      console.error(
        `[/webhooks/nominations] [${new Date().toISOString()}] - error processing nomination: ${
          error.message
        }.`
      );
    }
    return res.status(200).send({ status: "nok" });
  }
};
