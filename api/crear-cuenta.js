app.post("/api/crear-cuenta", async (req, res) => {
  try {

    // ========= TOKEN =========
    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token"
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(500).json({
        error: "No se pudo obtener access_token de Zoho",
        details: tokenData
      });
    }

    const accessToken = tokenData.access_token;

    // ========= DATOS =========
    const {
      nombre_empresa,
      nif,
      telefono,
      web,
      direccion,
      ciudad,
      provincia,
      codigo_postal,
      pais
    } = req.body;

    // ========= CREAR CUENTA =========
    const zohoResponse = await fetch(
      "https://www.zohoapis.com/crm/v8/Accounts",
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [
            {
              Account_Name: nombre_empresa,
              NIF: nif,
              Phone: telefono,
              Website: web,
              Billing_Street: direccion,
              Billing_City: ciudad,
              Billing_State: provincia,
              Billing_Code: codigo_postal,
              Billing_Country: pais
            }
          ]
        })
      }
    );

    const zohoData = await zohoResponse.json();

    res.json(zohoData);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error interno",
      details: error.message
    });

  }
});
