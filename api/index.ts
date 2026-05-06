import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import ImageKit from "imagekit";
import { Resend } from "resend";
import dotenv from "dotenv";

import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

// Firebase Config for Server-side Meta Injection
const FIREBASE_PROJECT_ID = "gen-lang-client-0318361197";
const FIRESTORE_DATABASE_ID = "ai-studio-80a7b2ab-bfbc-47ad-81ef-fc7e7d908d25";

app.use(express.json());

// Dynamic SEO / Social Preview Middleware
const injectMeta = async (req: any, res: any, next: any) => {
  const isBusinessPage = req.path.startsWith('/business/');
  if (!isBusinessPage) return next();

  const businessId = req.path.split('/')[2];
  if (!businessId) return next();

  try {
    // 1. Fetch business data via Firestore REST API (fastest way on server)
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/businesses/${businessId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`SEO: Business ${businessId} not found in Firestore REST API`);
      return next();
    }

    const data = await response.json();
    const fields = data.fields || {};
    
    const name = fields.name?.stringValue || "Ndangira Business";
    const description = fields.description?.stringValue?.slice(0, 160) || "Discover verified services in Rwanda.";
    const photo = fields.photos?.arrayValue?.values?.[0]?.stringValue || "/og-image.png";
    const category = fields.category?.stringValue || "Business";
    const city = fields.city?.stringValue || "Rwanda";

    // 2. Load the HTML (either from Dev Vite or Prod Dist)
    let html = "";
    const isProd = process.env.NODE_ENV === "production";
    const indexPath = isProd 
      ? path.join(process.cwd(), 'dist', 'index.html')
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(indexPath) && isProd) {
       return next(); // Build might not be ready
    }

    html = fs.readFileSync(indexPath, 'utf-8');

    // 3. Transform HTML (Vite specific transform in dev)
    if (!isProd && (global as any).vite) {
      html = await (global as any).vite.transformIndexHtml(req.url, html);
    }

    // 4. Injected rich metadata for scrapers
    const seoTitle = `${name} - ${category} in ${city} | Ndangira`;
    const seoDesc = `${name} is a ${category} located in ${city}. Find more on Ndangira.`;
    const fullUrl = `https://ndangira.rw${req.originalUrl}`;

    const injectedHtml = html
      .replace(/<title>.*?<\/title>/, `<title>${seoTitle}</title>`)
      .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${seoTitle}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${seoDesc}" />`)
      .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${photo}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${fullUrl}" />`)
      .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${seoDesc}" />`)
      .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${seoTitle}" />`)
      .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${seoDesc}" />`)
      .replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${photo}" />`);

    return res.status(200).set({ 'Content-Type': 'text/html' }).end(injectedHtml);

  } catch (error) {
    console.error("SEO Injection Error:", error);
    next();
  }
};

app.get('/business/:id', injectMeta);

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send("User-agent: *\nAllow: /\nSitemap: https://ndangira.rw/sitemap.xml");
});

// Basic Sitemap (Ideally this should fetch all business IDs but for now we provide the main entry points)
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ndangira.rw/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://ndangira.rw/pricing</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://ndangira.rw/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`);
});

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
  const { email, name, baseUrl } = req.body;
  const siteUrl = baseUrl || 'https://ndangira.rw';
  try {
    // NOTE: Resend requires a verified domain to send from anything other than 'onboarding@resend.dev'
    // If the user hasn't set RESEND_VERIFIED=true, we force onboarding@resend.dev
    const isVerified = process.env.RESEND_VERIFIED === 'true';
    const fromEmail = isVerified ? 'Ndangira <noreply@getpawa.co.rw>' : 'Ndangira <onboarding@resend.dev>';
    
    console.log(`Attempting to send email from: ${fromEmail} to: ${email}`);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'management@ndangira.rw',
      subject: 'Ndangira - Registration Received',
      html: `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #059669;">Welcome to Ndangira</h1>
          <p>Hello ${name},</p>
          <p>Thank you for choosing <strong>Ndangira</strong> by The Palace, Inc. We have received your business registration request.</p>
          <p>Our administration team is currently reviewing your details and verifying payment where applicable. You will receive another notification once your listing is active.</p>
          <p><a href="${siteUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Explore the Platform</a></p>
          <p>Best regards,<br/>The Ndangira Team</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 40px 0;" />
          <p style="font-size: 12px; color: #78716c;">The Palace, Inc. - The Palace Tech House<br/>Gisenyi, Rubavu, Rwanda</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(400).json({ success: false, error: error.message, details: error });
    }

    console.log("Resend Success:", data);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Resend Catch Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Critical failure in email service", 
      details: error.message
    });
  }
});

app.post("/api/email/approved", async (req, res) => {
  if (!resend) {
    return res.json({ success: true, message: "Resend not configured" });
  }
  const { email, businessName, baseUrl } = req.body;
  const siteUrl = baseUrl || 'https://ndangira.rw';
  try {
    const isVerified = process.env.RESEND_VERIFIED === 'true';
    const fromEmail = isVerified ? 'Ndangira <noreply@getpawa.co.rw>' : 'Ndangira <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'management@ndangira.rw',
      subject: `Ndangira - ${businessName} is now LIVE!`,
      html: `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #059669;">Your Listing is Active</h1>
          <p>Great news!</p>
          <p>Your business listing <strong>${businessName}</strong> has been approved and is now live on <strong>Ndangira</strong>.</p>
          <p>Users can now discover your services, see your contact details, and find you on our interactive map.</p>
          <p><a href="${siteUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">View Your Listing</a></p>
          <p>Thank you for being part of Africa's premier business network.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 40px 0;" />
          <p style="font-size: 12px; color: #78716c;">The Palace, Inc. - The Palace Tech House<br/>Gisenyi, Rubavu, Rwanda</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend Approval Email Error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Resend Approval Catch Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/email/bulk", async (req, res) => {
  if (!resend) {
    return res.json({ success: true, message: "Resend not configured" });
  }
  const { email, subject, html } = req.body;
  try {
    const isVerified = process.env.RESEND_VERIFIED === 'true';
    const fromEmail = isVerified ? 'Ndangira <noreply@getpawa.co.rw>' : 'Ndangira <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'management@ndangira.rw',
      subject: subject,
      html: html
    });

    if (error) {
      console.error("Resend Bulk Email Error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Resend Bulk Catch Error:", error);
    res.status(500).json({ success: false, error: error.message });
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
    (global as any).vite = vite; // Make vite available globally for SEO middleware
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
