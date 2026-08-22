import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import corsOptions from "./config/corsoptions.js";
import authRouter from "./routes/auth.routes.js";
import inquiryRouter from "./routes/inquiry.routes.js";
import quoteRouter from "./routes/quote.routes.js";
import serviceRouter from "./routes/service.routes.js";
import testimonialRouter from "./routes/testimonial.routes.js";
import faqRouter from "./routes/faq.routes.js";
import teamRouter from "./routes/team.routes.js";
import freelanceRouter from "./routes/freelance.routes.js";
import uploadRoute from "./routes/upload.routes.js";
import jobRouter from "./routes/job.routes.js";

const app = express();

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());


app.get("/health", (req, res) => {
  res.json({ message: "health is fine" });
});


app.use("/api/auth", authRouter);
app.use("/api/contact", inquiryRouter);
app.use("/api/inquiries", inquiryRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/services", serviceRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/reviews", testimonialRouter);
app.use("/api/faqs", faqRouter);
app.use("/api/team", teamRouter);
app.use("/api/freelance", freelanceRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/careers", jobRouter);
app.use("/api/upload", uploadRoute);

export default app;