import { Router } from "express";
import {
  getAllRecipients,
  createRecipient,
  toggleRecipientStatus,
  deleteRecipient,
} from "../controller/notification.controller.js";

const notificationRouter = Router();

notificationRouter.get("/recipients", getAllRecipients);
notificationRouter.post("/recipients", createRecipient);
notificationRouter.patch("/recipients/:id/toggle", toggleRecipientStatus);
notificationRouter.delete("/recipients/:id", deleteRecipient);

export default notificationRouter;
