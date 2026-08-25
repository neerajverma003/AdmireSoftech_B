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
import notificationRouter from "./routes/notification.routes.js";
import settingsRouter from "./routes/settings.routes.js";
import industryRouter from "./routes/industry.routes.js";
import caseStudyRouter from "./routes/caseStudy.routes.js";
import estimatorConfigRouter from "./routes/estimatorConfig.routes.js";

const app = express();

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());


app.get(["/health", "/api/health"], (req, res) => {
  res.json({ message: "health is fine", status: "OK" });
});


app.use("/api/auth", authRouter);
app.use("/api/contact", inquiryRouter);
app.use("/api/inquiries", inquiryRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/services", serviceRouter);
app.use("/api/industries", industryRouter);
app.use("/api/case-studies", caseStudyRouter);
app.use("/case-studies", caseStudyRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/reviews", testimonialRouter);
app.use("/api/faqs", faqRouter);
app.use("/api/team", teamRouter);
app.use("/api/freelance", freelanceRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/careers", jobRouter);
app.use("/api/upload", uploadRoute);
app.use("/api/notifications", notificationRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/estimator-config", estimatorConfigRouter);

export default app;