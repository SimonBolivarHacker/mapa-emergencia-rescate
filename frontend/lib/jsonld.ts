import { SITE_URL, SITE_NAME, CONTACT_EMAIL, X_PROFILE_URL } from "@/lib/site";

// Constructores de JSON-LD (schema.org) compartidos. Centralizan el marcado
// estructurado para que buscadores y agentes de IA (ChatGPT, Gemini, Claude,
// Perplexity) reconozcan la entidad y el contenido citable, sin duplicar el
// esquema en cada página.

type JsonLdNode = Record<string, unknown>;

/** Anclas @id estables para que distintos nodos referencien la misma entidad. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const ORG_DESCRIPTION =
  "Iniciativa ciudadana, independiente y no gubernamental que centraliza " +
  "información útil durante el terremoto en Venezuela: rescates, hospitales, " +
  "refugios, centros de acopio y ayuda humanitaria.";

/** Organización (ONG) detrás del sitio: permite a buscadores y agentes de IA
 *  reconocer y atribuir la fuente. */
export function organizationSchema(): JsonLdNode {
  return {
    "@type": ["NGO", "Organization"],
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: "Mapa Emergencia VE",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/opengraph-image.jpg`,
    email: CONTACT_EMAIL,
    description: ORG_DESCRIPTION,
    foundingLocation: { "@type": "Country", name: "Venezuela" },
    areaServed: { "@type": "Country", name: "Venezuela" },
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "customer support",
      areaServed: "VE",
      availableLanguage: ["Spanish"],
    },
    sameAs: [X_PROFILE_URL].filter(Boolean),
  };
}

/** Envuelve uno o más nodos en un documento JSON-LD con @context + @graph. */
export function graph(...nodes: JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}
