async function obtenerAccessToken() {

  const respuesta = await fetch(
    "https://accounts.zoho.com/oauth/v2/token",
    {
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
    }
  );

  const datos = await respuesta.json();

  if (!datos.access_token) {
    throw new Error("No se pudo obtener access_token");
  }

  return datos.access_token;
}

export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Método no permitido"
      });
    }

    const { nif, nombre_empresa } = req.body;

    if (!nif && !nombre_empresa) {
      return res.status(400).json({
        error: "Debes enviar nif o nombre_empresa"
      });
    }

    const accessToken = await obtenerAccessToken();

    // ========= CRITERIO =========

    let criteria = "";

    if (nif) {
      criteria = `(NIF:equals:${nif})`;
    } else {
      criteria = `(Account_Name:equals:${nombre_empresa})`;
    }

    // ========= BUSCAR =========

    const respuestaZoho = await fetch(
      `https://www.zohoapis.com/crm/v2/Accounts/search?criteria=${encodeURIComponent(criteria)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`
        }
      }
    );

    const datosZoho = await respuestaZoho.json();

    return res.status(200).json(datosZoho);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
