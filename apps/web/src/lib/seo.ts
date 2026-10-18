import type { MetaDescriptor } from "react-router";
import { resources } from "../i18n/resources";
import {
  publicPath,
  type PublicLocale,
  type PublicPage,
} from "../i18n/public-locale";

export const SITE_ORIGIN = "https://resumi.plinka.eu";
export const SOCIAL_IMAGE = `${SITE_ORIGIN}/og-image.png`;

export function publicMetadata(
  page: PublicPage,
  locale: PublicLocale,
): MetaDescriptor[] {
  const copy = resources[locale].translation.seo;
  const title = page === "landing" ? copy.landingTitle : copy.templatesTitle;
  const description =
    page === "landing" ? copy.landingDescription : copy.templatesDescription;
  const url = SITE_ORIGIN + publicPath(locale, page);
  const pageData = {
    "@type": page === "landing" ? "WebPage" : "CollectionPage",
    "@id": `${url}#page`,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: SOCIAL_IMAGE,
      width: 1200,
      height: 630,
    },
  };
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    ...(["en", "fr", "x-default"] as const).map((language) => ({
      tagName: "link" as const,
      rel: "alternate",
      hrefLang: language,
      href: SITE_ORIGIN + publicPath(language === "fr" ? "fr" : "en", page),
    })),
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "ResumI" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:locale", content: locale === "fr" ? "fr_FR" : "en_US" },
    {
      property: "og:locale:alternate",
      content: locale === "fr" ? "en_US" : "fr_FR",
    },
    { property: "og:image", content: SOCIAL_IMAGE },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: copy.imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: SOCIAL_IMAGE },
    { name: "twitter:image:alt", content: copy.imageAlt },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@graph": [
          ...(page === "landing"
            ? [
                {
                  "@type": "WebSite",
                  "@id": `${SITE_ORIGIN}/#website`,
                  name: "ResumI",
                  alternateName: "Resumi",
                  url: `${SITE_ORIGIN}/`,
                  inLanguage: ["en", "fr"],
                },
              ]
            : []),
          pageData,
        ],
      },
    },
  ];
}
