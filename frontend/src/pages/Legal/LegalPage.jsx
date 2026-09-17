import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import PageShell from "../../components/PageShell/PageShell";
import "../SimplePages.css";

const content = {
  privacy: {
    title: "Política de privacidad",
    eyebrow: "PROTECCIÓN DE DATOS",
    sections: [
      ["Responsable", "EcoFusion Rental Cars es el responsable del tratamiento de los datos personales que recopila a través de este sitio. Antes de operar comercialmente, completa en esta sección la razón social, identificación tributaria, domicilio y canal oficial para ejercer derechos."],
      ["Datos que tratamos", "Podemos tratar nombre, correo, teléfono, datos de cuenta, reservas, pagos, comunicaciones y el estado de las verificaciones necesarias para alquilar un vehículo. No almacenamos en EcoFusion los datos completos de tarjeta cuando el pago se procesa mediante un proveedor de pagos."],
      ["Finalidades", "Crear y proteger la cuenta, gestionar reservas, prestar el servicio de alquiler, procesar pagos, verificar identidad cuando sea necesario, prevenir fraude, atender solicitudes y cumplir obligaciones legales."],
      ["Bases y autorización", "La recolección de datos personales debe contar con una autorización previa, expresa e informada cuando la ley la requiera. En Colombia, el régimen general de protección de datos está establecido por la Ley 1581 de 2012 y sus normas reglamentarias incorporadas al Decreto 1074 de 2015."],
      ["Derechos del titular", "Puedes solicitar conocer, actualizar, rectificar y, cuando proceda, suprimir tus datos o revocar la autorización, y solicitar prueba de la autorización otorgada, mediante el canal de privacidad de EcoFusion."],
      ["Terceros", "Algunos servicios especializados pueden tratar datos por cuenta de EcoFusion, por ejemplo Firebase Authentication, proveedores de correo, verificación de identidad y pagos. Sus funciones se limitan a lo necesario para prestar el servicio correspondiente."],
      ["Seguridad", "Aplicamos autenticación, sesiones server-side, controles CSRF, validación de entradas, CORS restringido, registro de auditoría y controles antiabuso. Ningún sistema conectado a Internet puede garantizar riesgo cero."],
    ]
  },
  terms: {
    title: "Términos y condiciones", eyebrow: "CONDICIONES DE USO",
    sections: [
      ["Cuenta", "La persona usuaria debe proporcionar información verdadera y mantener bajo su control sus métodos de acceso."],
      ["Reservas", "Una solicitud de reserva queda sujeta a disponibilidad, validación de requisitos y confirmación del sistema."],
      ["Identidad", "EcoFusion puede requerir verificación de identidad antes de confirmar o entregar un vehículo cuando sea necesario por seguridad, prevención de fraude o requisitos del servicio."],
      ["Pagos", "Los pagos electrónicos se procesan mediante un proveedor especializado. Las condiciones específicas del cobro se muestran antes de completar el pago."],
      ["Cancelaciones", "Las reglas de cambio, cancelación y reembolso se mostrarán en el flujo de reserva aplicable antes de confirmar."],
      ["Uso aceptable", "No se permite utilizar la plataforma para fraude, suplantación, abuso de servicios, automatización maliciosa o intentos de acceder a datos de otras cuentas."],
    ]
  },
  cookies: {
    title: "Política de cookies", eyebrow: "TECNOLOGÍAS DEL SITIO",
    sections: [
      ["Cookies necesarias", "Usamos almacenamiento y cookies necesarias para mantener preferencias, sesiones y controles de seguridad."],
      ["Autenticación", "Firebase puede utilizar almacenamiento y mecanismos propios del flujo de autenticación para mantener la sesión y completar el acceso mediante proveedores como Google."],
      ["Preferencias", "Podemos guardar la preferencia de idioma y tema para que el sitio conserve la configuración elegida."],
      ["Terceros", "Los servicios externos pueden establecer tecnologías propias sujetas a sus políticas. El uso de estas tecnologías se limita a las funciones necesarias para el servicio."],
    ]
  }
};

export default function LegalPage({ type = "privacy" }) {
  const { language } = useApp();
  const data = content[type] || content.privacy;
  return <PageShell><section className="page-section"><div className="container legal-page">
    <span className="page-hero__eyebrow">{data.eyebrow}</span><h1>{data.title}</h1>
    <p className="legal-intro">{language === "es" ? "Información de transparencia y protección para el uso de EcoFusion Rental Cars." : "Transparency and protection information for using EcoFusion Rental Cars."}</p>
    {data.sections.map(([heading, body]) => <article className="legal-section" key={heading}><h2>{heading}</h2><p>{body}</p></article>)}
    <div className="legal-note">Documento operativo. Completa los datos legales del responsable y somételo a revisión profesional antes de utilizarlo como texto definitivo de cumplimiento.</div>
    <p className="legal-back"><Link to="/">Volver a EcoFusion</Link></p>
  </div></section></PageShell>;
}
