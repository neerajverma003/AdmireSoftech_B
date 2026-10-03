import crypto from "crypto";

const CAPTCHA_SECRET = process.env.JWT_SECRET || "admire_lead_captcha_secure_key_2026";
const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// In-memory set of used token nonces to prevent replay attacks
const usedNonces = new Set();

// Clean up expired nonces every 15 minutes to prevent memory leaks
setInterval(() => {
  usedNonces.clear();
}, 15 * 60 * 1000);

// Character sets for CAPTCHA
// Uppercase characters (avoiding easily confused glyphs like 0/O, 1/I)
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
// Lowercase characters (avoiding easily confused glyphs like l, o, i)
const LOWERCASE = "abcdefghjkmnpqrstuvwxyz";
// Numbers (avoiding 0 and 1 to prevent ambiguity)
const NUMBERS = "23456789";

const ALL_CHARS = UPPERCASE + LOWERCASE + NUMBERS;

/**
 * Generate a random 6-character text with a guaranteed mix of uppercase, lowercase, and numbers
 */
const generateRandomText = (length = 6) => {
  // Guarantee at least 1 uppercase, 1 lowercase, and 1 number
  const chars = [
    UPPERCASE.charAt(Math.floor(Math.random() * UPPERCASE.length)),
    LOWERCASE.charAt(Math.floor(Math.random() * LOWERCASE.length)),
    NUMBERS.charAt(Math.floor(Math.random() * NUMBERS.length)),
  ];

  // Fill remaining slots from the full mixed pool
  for (let i = 3; i < length; i++) {
    chars.push(ALL_CHARS.charAt(Math.floor(Math.random() * ALL_CHARS.length)));
  }

  // Shuffle characters so positions aren't predictable
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
};

/**
 * Generate an SVG image for the given text with anti-bot noise, rotation, and gradient
 * Uses brand colors suited for Admire Softech (cyan, deep slate, indigo)
 */
const generateSvg = (text) => {
  const width = 160;
  const height = 48;
  const chars = text.split("");

  // Noise lines
  let lines = "";
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const color = i % 2 === 0 ? "rgba(6,182,212,0.35)" : "rgba(99,102,241,0.35)";
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" />`;
  }

  // Noise dots
  let dots = "";
  for (let i = 0; i < 26; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = Math.random() * 1.5 + 0.5;
    const color = i % 2 === 0 ? "rgba(6,182,212,0.4)" : "rgba(30,41,59,0.35)";
    dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
  }

  // Character spans with slight rotations and offsets
  let textElements = "";
  const charSpacing = (width - 24) / chars.length;
  chars.forEach((ch, idx) => {
    const x = 18 + idx * charSpacing;
    const y = 32 + (Math.random() * 4 - 2);
    const rotate = Math.floor(Math.random() * 24 - 12);
    // Alternate between deep blue/slate and bright cyan-blue for clear readability & anti-bot protection
    const color = idx % 2 === 0 ? "#0284c7" : "#0f172a";
    textElements += `
      <text 
        x="${x}" 
        y="${y}" 
        font-family="'Arial', 'Helvetica', sans-serif" 
        font-size="22" 
        font-weight="900" 
        letter-spacing="2"
        fill="${color}" 
        transform="rotate(${rotate}, ${x}, ${y})"
      >
        ${ch}
      </text>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="border-radius: 10px; background: #f8fafc; border: 1px solid #cbd5e1; display: block;">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#f1f5f9" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="10" fill="url(#bgGrad)" />
      ${lines}
      ${dots}
      ${textElements}
    </svg>
  `.trim();
};

/**
 * Generate a new CAPTCHA challenge:
 * Returns { captchaToken, captchaSvg }
 */
export const generateCaptcha = () => {
  const text = generateRandomText(6);
  const nonce = crypto.randomBytes(8).toString("hex");
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

  const payload = `${text}:${expiresAt}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(payload)
    .digest("hex");

  const captchaToken = `${Buffer.from(payload).toString("base64url")}.${signature}`;
  const captchaSvg = generateSvg(text);

  return {
    captchaToken,
    captchaSvg,
  };
};

/**
 * Verify a user's answer against the token
 * Returns { isValid: boolean, message?: string }
 */
export const verifyCaptcha = (captchaToken, userAnswer, honeypot) => {
  // 1. Honeypot check: If the hidden honeypot field is filled, reject immediately
  if (honeypot && String(honeypot).trim().length > 0) {
    return { isValid: false, message: "Spam submission detected." };
  }

  if (!captchaToken || typeof captchaToken !== "string") {
    return { isValid: false, message: "Security verification code is required." };
  }

  if (!userAnswer || typeof userAnswer !== "string" || !userAnswer.trim()) {
    return { isValid: false, message: "Please enter the security verification code." };
  }

  const parts = captchaToken.split(".");
  if (parts.length !== 2) {
    return { isValid: false, message: "Invalid verification token format." };
  }

  const [encodedPayload, clientSignature] = parts;

  // 2. Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(Buffer.from(encodedPayload, "base64url").toString("utf8"))
    .digest("hex");

  const sigBufferA = Buffer.from(clientSignature, "hex");
  const sigBufferB = Buffer.from(expectedSignature, "hex");

  if (sigBufferA.length !== sigBufferB.length || !crypto.timingSafeEqual(sigBufferA, sigBufferB)) {
    return { isValid: false, message: "Invalid verification token signature." };
  }

  const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const [expectedAnswer, expiresAtStr, nonce] = payload.split(":");

  // 3. Expiration check
  const expiresAt = parseInt(expiresAtStr, 10);
  if (Date.now() > expiresAt) {
    return { isValid: false, message: "Security code expired. Please click refresh and try again." };
  }

  // 4. Replay attack check (one-time use)
  if (usedNonces.has(nonce)) {
    return { isValid: false, message: "Security code has already been used. Please refresh." };
  }

  // 5. Strict case-sensitive answer matching: User must enter exact characters including matching case
  const normalizedUser = userAnswer.trim();
  if (normalizedUser !== expectedAnswer) {
    return {
      isValid: false,
      message: "Security code does not match. Please enter the exact characters as shown (case-sensitive).",
    };
  }

  // Mark token nonce as consumed
  usedNonces.add(nonce);

  return { isValid: true };
};
