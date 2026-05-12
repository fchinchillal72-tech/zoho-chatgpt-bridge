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

    const accessToken = await obtenerAccessToken();

    // =========================
    // DATOS
    // =========================

    const {
      nombre_empresa,
      nif_empresa,
      telefono_empresa,
      web_empresa,

      nombre,
      apellidos,
      email,
      telefono,
      movil,
      nif_nie

    } = req.body;

    // =========================
    // BUSCAR CUENTA
    // =========================

    let accountId = null;

    if (nif_empresa) {

      const criteria = `(NIF:equals:${nif_empresa})`;

      const buscarCuenta = await fetch(
        `https://www.zohoapis.com/crm/v2/Accounts/search?criteria=${encodeURIComponent(criteria)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`
          }
        }
      );

      const cuentaData = await buscarCuenta.json();

      if (cuentaData.data && cuentaData.data.length > 0) {

        accountId = cuentaData.data[0].id;

      }

    }

    // =========================
    // CREAR CUENTA SI NO EXISTE
    // =========================

    if (!accountId && nombre_empresa) {

      const crearCuenta = await fetch(
        "https://www.zohoapis.com/crm/v2/Accounts",
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
                NIF: nif_empresa || "",
                Phone: telefono_empresa || "",
                Website: web_empresa || ""
              }
            ]
          })
        }
      );

      const cuentaCreada = await crearCuenta.json();

      if (
        cuentaCreada.data &&
        cuentaCreada.data[0] &&
        cuentaCreada.data[0].details
      ) {

        accountId = cuentaCreada.data[0].details.id;

      }

    }

    // =========================
    // CREAR CONTACTO
    // =========================

    const contactoPayload = {
      Last_Name: apellidos || "Sin apellidos",
      First_Name: nombre || "",
      Email: email || "",
      Phone: telefono || "",
      Mobile: movil || "",
      NIF_NIE: nif_nie || ""
    };

    // Vincular cuenta

    if (accountId) {
      contactoPayload.Account_Name = {
        id: accountId
      };
    }

    const crearContacto = await fetch(
      "https://www.zohoapis.com/crm/v2/Contacts",
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [contactoPayload]
        })
      }
    );

    const contactoData = await crearContacto.json();

    return res.status(200).json({
      success: true,
      account_id: accountId,
      contacto: contactoData
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
