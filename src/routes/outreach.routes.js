import { Router } from "express";
import {
  sendOutreachEmail,
  getOutreachHistory,
  deleteOutreachLog,
} from "../controller/outreachEmail.controller.js";
import {
  getSenderAccounts,
  createSenderAccount,
  deleteSenderAccount,
  setDefaultSenderAccount,
} from "../controller/senderAccount.controller.js";

const outreachRouter = Router();

// Outreach Email Dispatch & History
outreachRouter.post("/send", sendOutreachEmail);
outreachRouter.get("/history", getOutreachHistory);
outreachRouter.delete("/history/:id", deleteOutreachLog);

// Multi-Sender Email Accounts Management
outreachRouter.get("/senders", getSenderAccounts);
outreachRouter.post("/senders", createSenderAccount);
outreachRouter.delete("/senders/:id", deleteSenderAccount);
outreachRouter.patch("/senders/:id/default", setDefaultSenderAccount);

export default outreachRouter;
