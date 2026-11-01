import { useApp } from "../../context/AppContext";
import { Link } from "../../utils/router";
import PageShell from "../../components/PageShell/PageShell";
import "../SimplePages.css";

// Publish clear, service-specific policies without promising that no provider ever processes data.
const content = {
    es: {
        privacy: {
            title: "Política de privacidad",
            eyebrow: "PRIVACIDAD Y PROTECCIÓN DE DATOS",
            intro: "En FRANKEY Rentals Car tratamos la información personal para crear cuentas, gestionar reservas y prestar atención al cliente. No vendemos datos personales ni entregamos listas de clientes para la publicidad de otras empresas.",
            sections: [
                ["Responsable y contacto", "FRANKEY Rentals Car es la marca que opera este sitio. Para consultas sobre privacidad, solicitudes de acceso, corrección o eliminación, puedes llamar al 669-499-0584 o al 408-722-4634. La identidad jurídica completa del arrendador y los datos contractuales aplicables deben constar también en el contrato de alquiler."],
                ["Información que podemos tratar", "Nombre, correo electrónico, teléfono, datos de acceso y perfil, preferencias de idioma y tema, solicitudes de soporte, reservas, fechas y ubicaciones de recogida y devolución, información del vehículo, estado e identificadores de pago y registros de seguridad. Cuando una verificación de identidad esté habilitada, también se procesarán los datos que exija ese proceso."],
                ["Para qué utilizamos la información", "Crear y proteger cuentas; verificar correo o teléfono cuando corresponda; gestionar reservas, pagos, recogidas y devoluciones; responder consultas; prevenir fraude, abuso y accesos no autorizados; mantener la seguridad técnica; cumplir obligaciones legales y atender solicitudes de los titulares."],
                ["No vendemos tus datos", "FRANKEY no vende, alquila ni comercializa listas de clientes. Tampoco permite que terceros utilicen los datos de la cuenta para sus propias campañas publicitarias. El uso comercial de comunicaciones de FRANKEY debe respetar las preferencias y autorizaciones que correspondan; la opción de recibir novedades es independiente y voluntaria cuando se presenta."],
                ["Proveedores que prestan el servicio", "Algunos datos se procesan por proveedores tecnológicos únicamente para operar funciones solicitadas: Firebase para autenticación; Cloudflare para distribución y seguridad del sitio; Render para alojar servicios y datos; Square para pagos; y Persona cuando se habilite la verificación de identidad. Estos proveedores actúan bajo sus propias condiciones y políticas de privacidad. La información se limita a lo necesario para la función correspondiente."],
                ["Pagos y verificación de identidad", "Los pagos se gestionan mediante el proveedor de pago disponible en el flujo de reserva. FRANKEY recibe los identificadores y estados necesarios para conciliar la operación; no solicita que compartas por teléfono o WhatsApp el número completo de tu tarjeta ni códigos bancarios. Si se activa una verificación de identidad, se indicará el proveedor y los datos requeridos antes de continuar."],
                ["Conservación y acceso interno", "Conservamos la información durante el tiempo necesario para administrar la cuenta, atender la reserva, resolver incidencias, mantener registros de seguridad y cumplir obligaciones legales. El acceso interno se limita a funciones autorizadas. Los registros que deban conservarse por razones legales o de seguridad podrán mantenerse durante el plazo aplicable."],
                ["Seguridad", "El servicio utiliza autenticación, sesiones protegidas del servidor, controles contra solicitudes no autorizadas, validación de entradas, restricciones de acceso administrativo, registros de auditoría y límites de tráfico. Aplicamos medidas razonables para reducir riesgos, pero ningún servicio conectado a Internet puede garantizar seguridad absoluta."],
                ["Tus derechos y cómo ejercerlos", "Puedes solicitar información sobre tus datos, pedir su corrección o actualización y solicitar su eliminación o limitar determinados usos cuando la ley lo permita. También puedes retirar una autorización opcional para comunicaciones comerciales. Contacta con FRANKEY por cualquiera de los dos números publicados y especifica la solicitud; nunca envíes contraseñas ni códigos de recuperación."],
                ["Transferencias y servicios externos", "Los proveedores de tecnología pueden procesar información en centros de datos situados fuera de tu estado o país. Cuando esto ocurra, el tratamiento se rige por las condiciones del proveedor y las salvaguardas que exija la normativa aplicable. Al abrir WhatsApp, llamadas, servicios de pago o verificaciones externas, también se aplican las políticas del proveedor correspondiente."],
                ["Menores de edad", "El sitio no está diseñado para que menores creen cuentas o contraten alquileres por su cuenta. No envíes datos de menores salvo que el proceso y la ley aplicable lo permitan."]
            ],
            closing: "Esta política describe el tratamiento asociado al sitio y sus funciones. Las condiciones específicas del alquiler, la identidad legal del arrendador y cualquier requisito adicional se facilitarán en la documentación contractual correspondiente."
        },
        terms: {
            title: "Términos y condiciones",
            eyebrow: "CONDICIONES DE USO Y ALQUILER",
            intro: "Estos términos explican las reglas básicas para utilizar el sitio FRANKEY Rentals Car, crear una cuenta y solicitar un vehículo. Las condiciones particulares de cada alquiler se muestran en la información de la reserva y en el contrato aplicable.",
            sections: [
                ["Uso del sitio", "Utiliza la plataforma de forma legal y proporciona información correcta. No intentes interferir con el servicio, acceder a cuentas ajenas, probar credenciales de terceros, automatizar solicitudes abusivas ni extraer información mediante medios no autorizados."],
                ["Cuenta y seguridad", "Cada usuario debe proteger sus credenciales, mantener actualizados sus datos y avisar si sospecha que alguien ha accedido a su cuenta. FRANKEY puede solicitar verificaciones adicionales o limitar temporalmente operaciones cuando existan señales de fraude, riesgo o uso indebido."],
                ["Requisitos para alquilar", "La persona que conduzca debe cumplir los requisitos legales y contractuales que se indiquen para el vehículo y la jurisdicción de alquiler, incluida la documentación válida que se solicite. Los requisitos concretos se deben revisar antes de confirmar la reserva."],
                ["Disponibilidad y reservas", "Consultar un vehículo o enviar una solicitud no garantiza por sí solo que exista una reserva confirmada. La disponibilidad, las fechas, el lugar de recogida y la devolución quedan sujetos a validación y a la confirmación que emita el sistema o FRANKEY."],
                ["Precio y pagos", "El precio mostrado debe revisarse junto con el período, la moneda, los impuestos, los servicios adicionales y cualquier importe aplicable antes de completar el pago. Los pagos electrónicos se gestionan mediante el proveedor indicado en el proceso. No compartas contraseñas, códigos de un solo uso ni datos completos de tarjeta con personal de soporte."],
                ["Identidad y prevención del fraude", "FRANKEY puede solicitar verificación de identidad o documentación adicional cuando sea necesaria para validar una reserva, cumplir obligaciones o reducir riesgos. Si se utiliza un proveedor externo, se informará durante el proceso."],
                ["Entrega, uso y devolución", "El vehículo debe utilizarse conforme al contrato, a las normas de tránsito y a las instrucciones de recogida y devolución. Antes de aceptar el alquiler, revisa el estado del vehículo, las fechas, el lugar de entrega y devolución, la política de combustible, kilometraje, cobertura, depósito y cualquier cargo que resulte aplicable."],
                ["Cambios, cancelaciones y reembolsos", "Las reglas de modificación, cancelación, devolución de importes y posibles cargos dependen de la tarifa y del contrato correspondiente. Deben revisarse antes de confirmar el pago. Para aclarar una condición que no aparezca en pantalla, contacta con FRANKEY antes de continuar."],
                ["Suspensión por abuso", "Podemos bloquear temporalmente sesiones o solicitudes que generen tráfico abusivo, intentos repetidos de acceso, fraude, suplantación o riesgo para otras personas o para la plataforma. Las medidas de seguridad no sustituyen la revisión de una incidencia legítima."],
                ["Disponibilidad del servicio y cambios", "Trabajamos para mantener el sitio disponible y actualizado, pero pueden existir interrupciones por mantenimiento, proveedores externos o incidencias. Las modificaciones de estos términos se publicarán en esta página y no alterarán retroactivamente las condiciones de una reserva ya aceptada, salvo obligación legal."]
            ],
            closing: "La documentación específica de cada alquiler prevalece para los detalles particulares del vehículo, los importes y las obligaciones de recogida y devolución. Lee esos documentos antes de pagar o retirar el vehículo."
        },
        cookies: {
            title: "Política de cookies y almacenamiento",
            eyebrow: "TECNOLOGÍAS DEL SITIO",
            intro: "FRANKEY utiliza almacenamiento del navegador y tecnologías técnicas necesarias para que el sitio funcione, recuerde preferencias y proteja las sesiones.",
            sections: [
                ["Sesión y seguridad", "La plataforma utiliza cookies de sesión protegidas para mantener el acceso y validar solicitudes. No elimines las cookies de sesión mientras realizas una reserva o una operación autenticada."],
                ["Preferencias", "El idioma, el tema visual y algunas preferencias de interfaz pueden guardarse en el almacenamiento local del navegador para conservar tu configuración."],
                ["Autenticación", "Firebase Authentication puede utilizar cookies o almacenamiento propio para iniciar y mantener sesiones y completar los métodos de acceso que el usuario elija."],
                ["Seguridad y alojamiento", "Cloudflare y otros proveedores de infraestructura pueden utilizar tecnologías técnicas para distribuir el contenido, detectar abuso y mantener el sitio disponible."],
                ["Control del navegador", "Puedes borrar cookies y almacenamiento desde la configuración del navegador. Al hacerlo, puede que debas iniciar sesión de nuevo o volver a elegir tus preferencias. Bloquear tecnologías necesarias puede impedir que algunas funciones trabajen correctamente."],
                ["Tecnologías de terceros", "Al abrir WhatsApp, servicios de pago o verificación de identidad, pasas a servicios externos que pueden utilizar sus propias cookies y tecnologías. Consulta sus políticas antes de utilizarlos."]
            ],
            closing: "No describimos como necesarias tecnologías publicitarias que no forman parte de las funciones actuales del sitio. Esta política se actualizará si se incorporan nuevas herramientas."
        }
    },
    en: {
        privacy: {
            title: "Privacy Policy",
            eyebrow: "PRIVACY AND DATA PROTECTION",
            intro: "FRANKEY Rentals Car processes personal information to create accounts, manage reservations and provide customer support. We do not sell personal data or provide customer lists for other companies' advertising.",
            sections: [
                ["Controller and contact", "FRANKEY Rentals Car is the brand operating this website. For privacy questions or requests to access, correct or delete information, call 669-499-0584 or 408-722-4634. The rental agreement must also identify the legal rental operator and include the contractual details that apply to the transaction."],
                ["Information we may process", "Name, email, phone number, access and profile details, language and theme preferences, support requests, reservations, pickup and return dates and locations, vehicle information, payment identifiers and statuses, and security records. When identity verification is enabled, the information required for that check may also be processed."],
                ["How information is used", "To create and secure accounts; verify email or phone details where applicable; manage reservations, payments, pickup and return; answer questions; prevent fraud, abuse and unauthorized access; maintain technical security; meet legal obligations; and respond to data-subject requests."],
                ["We do not sell your data", "FRANKEY does not sell, rent or trade customer lists. Third parties are not permitted to use account data for their own advertising campaigns. FRANKEY marketing communications must respect applicable preferences and permissions; an optional choice to receive updates is separate and voluntary where shown."],
                ["Service providers", "Some information is processed by technology providers only to operate requested functions: Firebase for authentication; Cloudflare for site delivery and security; Render for application and data hosting; Square for payments; and Persona when identity verification is enabled. These providers operate under their own terms and privacy policies. Information is limited to what is needed for the relevant function."],
                ["Payments and identity checks", "Payments are handled through the payment provider shown in the reservation flow. FRANKEY receives the identifiers and statuses needed to reconcile the transaction; do not share full card numbers or banking codes over the phone or WhatsApp. When identity verification is enabled, the provider and required information will be identified during the process."],
                ["Retention and internal access", "Information is kept for as long as needed to administer an account, support a reservation, resolve issues, maintain security records and meet legal requirements. Internal access is limited to authorized functions. Records that must be retained for legal or security reasons may be kept for the period required."],
                ["Security", "The service uses authentication, protected server sessions, request-integrity controls, input validation, restricted administrative access, audit records and traffic limits. We apply reasonable measures to reduce risk, but no Internet-connected service can guarantee absolute security."],
                ["Your rights and requests", "You may request information about your data, ask for corrections or updates, and request deletion or limits on certain uses where applicable law allows. You may also withdraw optional marketing consent. Contact FRANKEY through either published phone number and describe your request; never send passwords or recovery codes."],
                ["Transfers and external services", "Technology providers may process information in data centers outside your state or country. Where this happens, processing is governed by provider terms and safeguards required by applicable law. When you open WhatsApp, payment or verification services, the relevant provider's policies also apply."],
                ["Children", "The site is not designed for children to create accounts or enter rental agreements on their own. Do not submit children's information unless the relevant process and applicable law allow it."]
            ],
            closing: "This policy describes processing associated with the website and its features. The rental paperwork will identify the legal rental operator and any additional requirements that apply to the specific rental."
        },
        terms: {
            title: "Terms and Conditions",
            eyebrow: "SITE USE AND RENTAL TERMS",
            intro: "These terms explain the basic rules for using FRANKEY Rentals Car, creating an account and requesting a vehicle. The specific conditions for each rental appear in the reservation details and applicable rental agreement.",
            sections: [
                ["Website use", "Use the platform lawfully and provide accurate information. Do not interfere with the service, access another person's account, test third-party credentials, automate abusive requests or collect information through unauthorized means."],
                ["Account and security", "Each user must protect their credentials, keep their details up to date and report suspected unauthorized access. FRANKEY may request additional checks or temporarily limit operations when there are signs of fraud, risk or misuse."],
                ["Rental eligibility", "The driver must meet the legal and contractual requirements stated for the vehicle and rental jurisdiction, including any valid documents requested. Review the specific requirements before confirming a reservation."],
                ["Availability and reservations", "Viewing a vehicle or submitting a request does not by itself guarantee a confirmed reservation. Availability, dates, pickup location and return location are subject to validation and confirmation by the system or FRANKEY."],
                ["Pricing and payments", "Review the displayed price together with the rental period, currency, taxes, additional services and any applicable amounts before completing payment. Electronic payments are handled through the provider identified in the process. Do not share passwords, one-time codes or full card details with support staff."],
                ["Identity and fraud prevention", "FRANKEY may request identity verification or additional documents when needed to validate a reservation, meet obligations or reduce risk. Where an external provider is used, it will be identified during the process."],
                ["Pickup, use and return", "The vehicle must be used in accordance with the rental agreement, traffic rules and pickup and return instructions. Before accepting the rental, review the vehicle condition, dates, pickup and return location, fuel policy, mileage, coverage, deposit and any applicable charges."],
                ["Changes, cancellations and refunds", "Modification, cancellation, refund and possible charge rules depend on the applicable rate and rental agreement. Review them before confirming payment. Contact FRANKEY before proceeding if a condition is not displayed."],
                ["Suspension for abuse", "We may temporarily block sessions or requests that create abusive traffic, repeated access attempts, fraud, impersonation or risk to other people or the platform. Security measures do not replace review of a legitimate support issue."],
                ["Service availability and updates", "We work to keep the website available and current, but maintenance, external providers or incidents may cause interruptions. Changes to these terms will be posted here and will not retroactively change an accepted reservation except where required by law."]
            ],
            closing: "The specific rental paperwork controls vehicle-specific details, amounts and pickup and return obligations. Read those documents before paying or collecting the vehicle."
        },
        cookies: {
            title: "Cookie and Storage Policy",
            eyebrow: "SITE TECHNOLOGIES",
            intro: "FRANKEY uses browser storage and technical technologies needed to operate the website, remember preferences and protect sessions.",
            sections: [
                ["Session and security", "The platform uses protected session cookies to maintain access and validate requests. Do not delete session cookies while completing a reservation or authenticated operation."],
                ["Preferences", "Language, visual theme and some interface preferences may be saved in browser storage so your chosen settings are remembered."],
                ["Authentication", "Firebase Authentication may use its own cookies or storage to sign in, maintain sessions and complete the sign-in methods selected by the user."],
                ["Security and hosting", "Cloudflare and other infrastructure providers may use technical technologies to deliver content, detect abuse and keep the website available."],
                ["Browser controls", "You can clear cookies and storage in your browser settings. You may then need to sign in again or reselect preferences. Blocking necessary technologies may prevent some features from working."],
                ["Third-party technologies", "When you open WhatsApp, payment or identity-verification services, you use external services that may apply their own cookies and technologies. Review their policies before using them."]
            ],
            closing: "We do not describe advertising technologies as necessary when they are not part of the site's current functions. This policy will be updated if additional tools are introduced."
        }
    }
};

// Render each legal document as a readable, structured page with no placeholder operational claims.
export default function LegalPage({ type = "privacy" }) {
    const { language } = useApp();
    const data = content[language]?.[type] || content.es[type] || content.es.privacy;

    return (
        <PageShell>
            <section className="page-section">
                <div className="container legal-page">
                    <header className="legal-page__header">
                        <span className="page-hero__eyebrow">{data.eyebrow}</span>
                        <h1>{data.title}</h1>
                        <p className="legal-intro">{data.intro}</p>
                    </header>
                    <div className="legal-page__sections">
                        {data.sections.map(([heading, body], index) => (
                            <article className="legal-section" key={heading}>
                                <span className="legal-section__number">{String(index + 1).padStart(2, "0")}</span>
                                <div><h2>{heading}</h2><p>{body}</p></div>
                            </article>
                        ))}
                    </div>
                    <div className="legal-note">{data.closing}</div>
                    <p className="legal-back"><Link to="/">{language === "es" ? "Volver al inicio" : "Back to home"}</Link></p>
                </div>
            </section>
        </PageShell>
    );
}
