import { Request, Response } from "express";
import { dcsQueue } from "../../queues/dcs.js";
import { xmtpQueue } from "../../queues/xmtp.js";
import { repliesQueue } from "../../queues/replies.js";

export const metricsHandler = async (_: Request, res: Response) => {
  res.status(200).send({
    result: {
      replies: {
        completed: await repliesQueue?.getCompletedCount(),
        failed: await repliesQueue?.getFailedCount(),
        waiting: await repliesQueue?.getWaitingCount(),
        delayed: await repliesQueue?.getDelayedCount(),
      },
      dcs: {
        completed: await dcsQueue?.getCompletedCount(),
        failed: await dcsQueue?.getFailedCount(),
        waiting: await dcsQueue?.getWaitingCount(),
        delayed: await dcsQueue?.getDelayedCount(),
      },
      xmtp: {
        completed: await xmtpQueue?.getCompletedCount(),
        failed: await xmtpQueue?.getFailedCount(),
        waiting: await xmtpQueue?.getWaitingCount(),
        delayed: await xmtpQueue?.getDelayedCount(),
      },
    },
  });
};
