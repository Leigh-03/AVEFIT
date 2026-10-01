const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Google ID token is required.");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google account.");
  }

  if (!payload.email || !payload.sub) {
    throw new Error("Google account does not contain the required information.");
  }

  if (payload.email_verified !== true) {
    throw new Error("Google email is not verified.");
  }

  return {
    google_id: payload.sub,
    email: payload.email.toLowerCase().trim(),
    first_name: payload.given_name || "",
    last_name: payload.family_name || "",
    name: payload.name || "",
    picture: payload.picture || null,
  };
}

module.exports = {
  verifyGoogleToken,
};