export default async function handler(req, res) {
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;

  try {
    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token"
      })
    });

    const tokenData = await tokenResponse.json();

if (!tokenData.access_token) {
  return res.status(500).json({
    error: "Could not obtain Zoho access token",
    zoho_response: tokenData
  });
}

const accessToken = tokenData.access_token;

    const zohoResponse = await fetch("https://www.zohoapis.com/crm/v2/settings/modules", {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`
      }
    });

    const data = await zohoResponse.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
