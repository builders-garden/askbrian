import {
  MessageWithFarcasterIdBody,
  MessageWithRecipientBody,
  ReplyBody,
} from "../schemas.js";
import { dcsQueue, processDC } from "./dcs.js";
import { processReply, repliesQueue } from "./replies.js";
import { xmtpQueue, processXMTPMessage } from "./xmtp.js";

const REPLIES_JOB_NAME = "create-reply";
const DCS_JOB_NAME = "create-dc";
const XMTP_JOB_NAME = "send-xmtp-message";

export const addToRepliesQueue = async (data: ReplyBody) => {
  if (repliesQueue) {
    await repliesQueue.add(`${REPLIES_JOB_NAME}-${data.id}`, data, {
      attempts: 1,
      delay: 1000,
    });
    return;
  }
  await processReply({ data });
};

export const addToDCsQueue = async (data: MessageWithFarcasterIdBody) => {
  if (dcsQueue) {
    await dcsQueue.add(`${DCS_JOB_NAME}-${data.id}`, data, {
      attempts: 1,
      delay: 1000,
    });
    return;
  }
  await processDC({ data });
};

export const addToXMTPQueue = async (data: MessageWithRecipientBody) => {
  if (xmtpQueue) {
    await xmtpQueue.add(`${XMTP_JOB_NAME}-${data.id}`, data, {
      attempts: 1,
      delay: 1000,
    });
    return;
  }
  await processXMTPMessage({ data });
};
