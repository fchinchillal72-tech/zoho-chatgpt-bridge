async function obtenerAccessToken() {
  const respuesta = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token"
    })
  });

  const datos = await respuesta.json();

  if (!datos.access_token) {
    throw new Error("No se pudo obtener access_token de Zoho");
  }

  return datos.access_token;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido. Usa POST." });
    }

    const cuenta = req.body;

    if (!cuenta.nombre_empresa) {
      return res.status(400).json({
        error: "El campo 'nombre_empresa' es obligatorio."
      });
    }

    const accessToken = await obtenerAccessToken();

    const respuestaZoho = await fetch("https://www.zohoapis.com/crm/v2/Accounts", {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: [
          {
            Account_Name: cuenta.nombre_empresa,
            NIF: cuenta.nif || "",
            Phone: cuenta.telefono || "",
            Website: cuenta.web || "",
            Billing_Street: cuenta.direccion || "",
            Billing_City: cuenta.ciudad || "",
            Billing_State: cuenta.provincia || "",
            Billing_Code: cuenta.codigo_postal || "",
            Billing_Country: cuenta.pais || ""
          }
        ]
      })
    });

    const datosZoho = await respuestaZoho.json();
    return res.status(200).json(datosZoho);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
