import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import PageShell from "../../components/PageShell/PageShell";
import "../SimplePages.css";

const content = {
  es: {
    privacy: { title: "Política de privacidad", eyebrow: "PROTECCIÓN DE DATOS", sections: [
      ["Responsable", "EcoFusion Rental Cars es el responsable del tratamiento de los datos personales que recopila a través de este sitio. Antes de operar comercialmente, completa aquí la razón social, identificación tributaria, domicilio y canal oficial para ejercer derechos."],
      ["Datos que tratamos", "Podemos tratar nombre, correo, teléfono, datos de cuenta, reservas, pagos, comunicaciones y el estado de verificaciones necesarias para alquilar un vehículo. Cuando el pago lo procesa un proveedor externo, EcoFusion no debe almacenar los datos completos de la tarjeta."],
      ["Finalidades", "Crear y proteger la cuenta, gestionar reservas, prestar el servicio de alquiler, procesar pagos, verificar identidad cuando sea necesario, prevenir fraude, atender solicitudes y cumplir obligaciones legales."],
      ["Bases y autorización", "La recolección de datos personales debe contar con autorización previa, expresa e informada cuando la ley la requiera. En Colombia, el régimen general de protección de datos está establecido por la Ley 1581 de 2012 y sus normas reglamentarias."],
      ["Derechos del titular", "Puedes solicitar conocer, actualizar, rectificar y, cuando proceda, suprimir tus datos o revocar la autorización, y solicitar prueba de la autorización otorgada mediante el canal de privacidad de EcoFusion."],
      ["Terceros", "Algunos servicios especializados pueden tratar datos por cuenta de EcoFusion, por ejemplo Firebase Authentication, correo, verificación de identidad y pagos. Sus funciones deben limitarse a lo necesario para prestar el servicio correspondiente."],
      ["Seguridad", "Aplicamos autenticación, sesiones servidor, controles CSRF, validación de entradas, CORS restringido, registros de auditoría y controles antiabuso. Ningún sistema conectado a Internet puede garantizar riesgo cero."]
    ]},
    terms: { title: "Términos y condiciones", eyebrow: "CONDICIONES DE USO", sections: [
      ["Cuenta", "La persona usuaria debe proporcionar información verdadera y mantener bajo su control sus métodos de acceso."],
      ["Reservas", "Una solicitud de reserva queda sujeta a disponibilidad, validación de requisitos y confirmación del sistema."],
      ["Identidad", "EcoFusion puede requerir verificación de identidad antes de confirmar o entregar un vehículo cuando sea necesario por seguridad, prevención de fraude o requisitos del servicio."],
      ["Pagos", "Los pagos electrónicos se procesan mediante un proveedor especializado. Las condiciones específicas del cobro se muestran antes de completar el pago."],
      ["Cancelaciones", "Las reglas de cambio, cancelación y reembolso se mostrarán en el flujo de reserva aplicable antes de confirmar."],
      ["Uso aceptable", "No se permite utilizar la plataforma para fraude, suplantación, abuso de servicios, automatización maliciosa o intentos de acceder a datos de otras cuentas."]
    ]},
    cookies: { title: "Política de cookies", eyebrow: "TECNOLOGÍAS DEL SITIO", sections: [
      ["Cookies necesarias", "Usamos almacenamiento y cookies necesarias para mantener preferencias, sesiones y controles de seguridad."],
      ["Autenticación", "Firebase puede utilizar almacenamiento y mecanismos propios del flujo de autenticación para mantener la sesión y completar el acceso mediante proveedores como Google."],
      ["Preferencias", "Podemos guardar la preferencia de idioma y tema para que el sitio conserve la configuración elegida."],
      ["Terceros", "Los servicios externos pueden establecer tecnologías propias sujetas a sus políticas. El uso de estas tecnologías se limita a las funciones necesarias para el servicio."]
    ]}
  },
  en: {
    privacy: { title: "Privacy Policy", eyebrow: "DATA PROTECTION", sections: [
      ["Controller", "EcoFusion Rental Cars is responsible for the personal-data processing carried out through this site. Before commercial operation, complete this section with the legal entity name, tax ID, address and official privacy contact channel."],
      ["Data we process", "We may process your name, email, phone, account details, reservations, payments, communications and the status of checks required to rent a vehicle. When payment is processed by a third party, EcoFusion should not store full card details."],
      ["Purposes", "Create and protect accounts, manage reservations, provide rental services, process payments, verify identity when necessary, prevent fraud, answer requests and meet legal obligations."],
      ["Legal basis and consent", "Personal-data collection must obtain prior, express and informed authorization where required by law. In Colombia, the general data-protection regime is established by Law 1581 of 2012 and its regulations."],
      ["Your rights", "You may request access, update or correction of your data and, where applicable, deletion or withdrawal of consent, and request evidence of the authorization you provided through EcoFusion's privacy channel."],
      ["Third parties", "Specialized services may process data on behalf of EcoFusion, such as Firebase Authentication, email, identity verification and payment providers. Their use should be limited to what is necessary for the relevant service."],
      ["Security", "We apply authentication, server-side sessions, CSRF controls, input validation, restricted CORS, audit logging and abuse controls. No Internet-connected system can guarantee zero risk."]
    ]},
    terms: { title: "Terms and Conditions", eyebrow: "TERMS OF USE", sections: [
      ["Account", "Users must provide accurate information and keep control of their access methods."],
      ["Reservations", "A reservation request is subject to availability, requirement checks and system confirmation."],
      ["Identity", "EcoFusion may require identity verification before confirming or handing over a vehicle when needed for safety, fraud prevention or service requirements."],
      ["Payments", "Electronic payments are processed by a specialized provider. The applicable charge conditions are shown before payment is completed."],
      ["Cancellations", "Change, cancellation and refund rules will be shown in the applicable reservation flow before confirmation."],
      ["Acceptable use", "The platform may not be used for fraud, impersonation, service abuse, malicious automation or attempts to access another account's data."]
    ]},
    cookies: { title: "Cookie Policy", eyebrow: "SITE TECHNOLOGIES", sections: [
      ["Necessary cookies", "We use necessary storage and cookies to keep preferences, sessions and security controls working."],
      ["Authentication", "Firebase may use storage and its own authentication mechanisms to maintain sessions and complete sign-in through providers such as Google."],
      ["Preferences", "We may store language and theme preferences so the site keeps the selected configuration."],
      ["Third parties", "External services may set their own technologies under their policies. Their use is limited to what is necessary for the service."]
    ]}
  }
};

export default function LegalPage({ type = "privacy" }) {
  const { language, translations: t } = useApp();
  const data = content[language]?.[type] || content.es[type] || content.es.privacy;
  return <PageShell><section className="page-section"><div className="container legal-page">
    <span className="page-hero__eyebrow">{data.eyebrow}</span><h1>{data.title}</h1>
    <p className="legal-intro">{t.homeUi.legalIntro}</p>
    {data.sections.map(([heading, body]) => <article className="legal-section" key={heading}><h2>{heading}</h2><p>{body}</p></article>)}
    <div className="legal-note">{t.homeUi.legalOperational}</div>
    <p className="legal-back"><Link to="/">{t.homeUi.legalBack}</Link></p>
  </div></section></PageShell>;
}
