export default async function handler(req, res) {
  res.status(200).json({
    accounts: {
      module: "Accounts",
      required: ["Account_Name"],
      recommended: [
        "Account_Name",
        "NIF",
        "Phone",
        "Website",
        "Billing_Street",
        "Billing_City",
        "Billing_State",
        "Billing_Code",
        "Billing_Country",
        "Employees",
        "Categor_a",
        "Exportadora",
        "Importadora"
      ],
      notes: {
        Account_Name: "Nombre de la cuenta / empresa. Obligatorio.",
        NIF: "CIF/NIF. Campo único.",
        Categor_a: "Multiselección: Autónomo, Ayuntamiento, Centro Colaborador, PYME.",
        Exportadora: "Picklist: Si, No.",
        Importadora: "Picklist: Si, No."
      }
    },
    contacts: {
      module: "Contacts",
      required: ["Last_Name"],
      recommended: [
        "First_Name",
        "Last_Name",
        "Email",
        "Phone",
        "Mobile",
        "Account_Name",
        "NIF_NIE",
        "Tipo_de_contacto",
        "Provincia",
        "Poblaci_n",
        "Situaci_n_laboral",
        "Mailing_Street",
        "Mailing_City",
        "Mailing_State",
        "Mailing_Zip",
        "Mailing_Country"
      ],
      notes: {
        Last_Name: "Apellidos. Obligatorio.",
        Account_Name: "Lookup a Accounts. Debe vincularse con una cuenta existente o importarse tras crear cuentas.",
        Email: "Campo email. Es único.",
        NIF_NIE: "NIF/NIE del contacto. Campo único.",
        Tipo_de_contacto: "Picklist: Autónomo, Docente, Empleado, Desempleado, Administración Pública.",
        Situaci_n_laboral: "Picklist: Cuenta ajena, Cuenta propia, Desempleado, Empleado, Estudiante, Pensionista, Sociedad."
      }
    }
  });
}
