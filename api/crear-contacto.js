async function obtenerAccessToken() {
  const respuesta = await fetch("https://accounts.zoho.com/oauth/v2/token", {
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

  const datos = await respuesta.json();

  if (!datos.access_token) {
    throw new Error("No se pudo obtener access_token de Zoho");
  }

  return datos.access_token;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Método no permitido. Usa POST."
      });
    }

    const contacto = req.body;

    if (!contacto.apellidos) {
      return res.status(400).json({
        error: "El campo 'apellidos' es obligatorio."
      });
    }

    const accessToken = await obtenerAccessToken();

    const respuestaZoho = await fetch(
      "https://www.zohoapis.com/crm/v2/Contacts",
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [
            {
              First_Name: contacto.nombre || "",
              Last_Name: contacto.apellidos,
              Email: contacto.email || "",
              Phone: contacto.telefono || "",
              Mobile: contacto.movil || "",
              NIF_NIE: contacto.nif_nie || "",
              Tipo_de_contacto: contacto.tipo_contacto || "",
              Provincia: contacto.provincia || "",
              Poblaci_n: contacto.poblacion || "",
              Situaci_n_laboral: contacto.situacion_laboral || "",
              Mailing_Street: contacto.direccion || "",
              Mailing_City: contacto.ciudad || "",
              Mailing_State: contacto.provincia_correspondencia || "",
              Mailing_Zip: contacto.codigo_postal || "",
              Mailing_Country: contacto.pais || ""
            }
          ]
        })
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
