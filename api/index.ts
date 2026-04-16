import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import ImageKit from "imagekit";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ImageKit Auth
const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.VITE_IMAGEKIT_ENDPOINT || "",
});

app.get("/api/imagekit/auth", (req, res) => {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error("IMAGEKIT_PRIVATE_KEY is missing in environment variables");
      return res.status(500).json({ error: "Server misconfiguration: Private Key missing" });
    }
    const result = imagekit.getAuthenticationParameters();
    res.json(result);
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    res.status(500).json({ error: "Failed to get auth params" });
  }
});

// Resend Email Endpoint
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.post("/api/email/welcome", async (req, res) => {
  if (!resend) {
    console.warn("Resend not configured, skipping email.");
    return res.json({ success: true, message: "Resend not configured" });
  }
  const { email, name } = req.body;
  try {
    // NOTE: Resend requires a verified domain to send from anything other than 'onboarding@resend.dev'
    const fromEmail = process.env.NODE_ENV === 'production' && !process.env.RESEND_VERIFIED ? 'onboarding@resend.dev' : 'Ndangira <management@ndangira.rw>';
    
    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to Ndangira - We received your listing',
      html: `<p>Hello ${name},</p><p>Thank you for registering your business with Ndangira. Our team is currently reviewing your listing and we will notify you once it goes live.</p>`
    });
    console.log("Resend Success:", data);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Resend Error Detail:", error);
    // Return detailed error in development to help user
    res.status(500).json({ 
      success: false, 
      error: "Failed to send email", 
      details: error.message,
      code: error.code || error.statusCode
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files from the dist directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // SPA fallback: Return index.html for all non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only start listening if NOT on Vercel (Vercel handles listening)
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
