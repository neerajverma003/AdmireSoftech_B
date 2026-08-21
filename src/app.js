import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import inquiryRouter from "./routes/inquiry.routes.js";
import quoteRouter from "./routes/quote.routes.js";
import serviceRouter from "./routes/service.routes.js";
import testimonialRouter from "./routes/testimonial.routes.js";
import faqRouter from "./routes/faq.routes.js";
import teamRouter from "./routes/team.routes.js";

const app = express();


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, postman, curl)
      if (!origin) return callback(null, true);
      if (
        origin.startsWith("http://localhost:")
        
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

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

export default app;