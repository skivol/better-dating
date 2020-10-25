import { Helmet } from "react-helmet";
import { updated as updatedValue } from "../constants";

const domainName = "смотрины.укр";
const altDomainName = "смотрины.рус";
const baseUrl = `https://${domainName}`;
const absoluteUrl = (path: string) => `${baseUrl}${path}`;
const seoImageURL = (file: string) => `${baseUrl}/images/${file}`;

interface CommonMetaProps {
  schema?: string;
  title: string;
  description: string;
  contentType?: string;
  published?: string;
  category?: string;
  tags?: string;
  twitter?: string;
  image?: string;
}

export interface MetaProps extends CommonMetaProps {
  path: string;
}

interface MetaTagsProps extends CommonMetaProps {
  url: string;
  updated: string;
}

const getMetaTags = ({
  title,
  description,
  url,
  contentType = "website",
  published,
  updated,
  category,
  tags,
  twitter,
  image,
}: MetaTagsProps) => {
  const metaTags = [
    {
      name: "viewport",
      content:
        "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no",
    },
    { itemprop: "name", content: title },
    { itemprop: "description", content: description },
    { name: "description", content: description },
    /* { name: 'twitter:site', content: '@skivol' },
		{ name: 'twitter:title', content: `${title} | ${domainName} & ${altDomainName}` },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:creator', content: twitter || '@skivol' }, */
    {
      name: "og:title",
      content: `${title} | ${domainName} & ${altDomainName}`,
    },
    { name: "og:type", content: contentType },
    { name: "og:url", content: url },
    { name: "og:description", content: description },
    { name: "og:site_name", content: domainName },
    { name: "og:locale", content: "ru_RU" },
    { name: "language", content: "ru_RU" },
    {
      name: "google-site-verification",
      content: "H5lx792ITP1wTfGQOHvdUgVn-hCec4NVN1_hjojG0uQ",
    },
    { name: "yandex-verification", content: "7c939c3f5bb596a0" },
    { name: "msvalidate.01", content: "F40FD4A0E1B52B879491992CE9E2864B" },
    // { name: 'fb:app_id', content: '<FB App ID>' },
  ];

  if (published) {
    metaTags.push({ name: "article:published_time", content: published });
  }
  if (updated) {
    metaTags.push({ name: "article:modified_time", content: updated });
  }
  if (category) {
    metaTags.push({ name: "article:section", content: category });
  }
  if (tags) {
    metaTags.push({ name: "article:tag", content: tags });
  }
  if (image) {
    metaTags.push({ itemprop: "image", content: image });
    metaTags.push({ name: "twitter:image:src", content: image });
    metaTags.push({ name: "og:image", content: image });
    metaTags.push({ name: "twitter:card", content: "summary_large_image" });
  } else {
    metaTags.push({ name: "twitter:card", content: "summary" });
  }

  return metaTags;
};

interface HtmlAttributesProps {
  schema?: string;
}

const getHtmlAttributes = ({ schema }: HtmlAttributesProps) => {
  let result: any = {
    lang: "ru",
  };
  if (schema) {
    result = {
      ...result,
      itemScope: undefined,
      itemType: `http://schema.org/${schema}`,
    };
  }
  return result;
};

const Meta = ({
  schema,
  title,
  description,
  path,
  contentType = "website",
  published,
  category,
  tags,
  twitter,
}: MetaProps) => (
  <Helmet
    htmlAttributes={getHtmlAttributes({
      schema,
    })}
    title={title}
    link={[{ rel: "canonical", href: absoluteUrl(path) }]}
    meta={getMetaTags({
      title,
      description,
      contentType,
      url: absoluteUrl(path),
      image: absoluteUrl("/favicon-192.png"),
      published,
      updated: updatedValue,
      category,
      tags,
      twitter,
    })}
  />
);

export default Meta;
