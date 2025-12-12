import type {
  StrapiEntity,
  StrapiArticle,
  StrapiCategory,
} from '../types/strapi';
import { marked } from 'marked';

const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

interface FetchApiProps {
  endpoint: string;
  query?: Record<string, string>;
  wrappedByKey?: string;
  wrappedByList?: boolean;
}


async function fetchApi<T>({
  endpoint,
  query,
  wrappedByKey,
  wrappedByList,
}: FetchApiProps): Promise<T> {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1);
  }

  const url = new URL(`${STRAPI_URL}/api/${endpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const res = await fetch(url.toString(), { headers });

  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status} ${res.statusText}`);
  }

  let data = await res.json();

  if (wrappedByKey) {
    data = data[wrappedByKey];
  }

  if (wrappedByList) {
    data = data[0];
  }

  return data as T;
}

export async function getArticles(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  locale?: string;
}) {
  const query: Record<string, string> = {
    'populate': '*',
  };

  if (params?.page) {
    query['pagination[page]'] = params.page.toString();
  }
  if (params?.pageSize) {
    query['pagination[pageSize]'] = params.pageSize.toString();
  }
  if (params?.sort) {
    query['sort'] = params.sort;
  }

  if (params?.locale) {
    query['filters[locale][$eq]'] = params.locale;
  }

  return fetchApi<{ data: StrapiEntity<StrapiArticle>[] }>({
    endpoint: 'articles',
    query,
  });
}

export async function getArticleBySlug(slug: string, locale?: string) {
  const query: Record<string, string> = {
    'filters[slug][$eq]': slug,
    'populate': '*',
  };

  if (locale) {
    query['filters[locale][$eq]'] = locale;
  }

  const data = await fetchApi<{ data: StrapiEntity<StrapiArticle>[] }>({
    endpoint: 'articles',
    query,
  });

  return data.data.length > 0 ? data.data[0] : null;
}

export async function getCategories(params?: { locale?: string }) {
  const query: Record<string, string> = {
    'populate': '*',
  };

  if (params?.locale) {
    query['filters[locale][$eq]'] = params.locale;
  }

  return fetchApi<{ data: StrapiCategory[] }>({
    endpoint: 'categories',
    query,
  });
}

export async function getCategoryBySlug(slug: string, locale?: string) {
  const query: Record<string, string> = {
    'filters[slug][$eq]': slug,
    'populate': '*',
  };

  if (locale) {
    query['filters[locale][$eq]'] = locale;
  }

  const data = await fetchApi<{ data: StrapiCategory[] }>({
    endpoint: 'categories',
    query,
  });

  return data.data.length > 0 ? data.data[0] : null;
}

export async function getArticlesByCategory(categorySlug: string, params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  locale?: string;
}) {
  const query: Record<string, string> = {
    'populate': '*',
    'filters[category][slug][$eq]': categorySlug,
  };

  if (params?.page) {
    query['pagination[page]'] = params.page.toString();
  }
  if (params?.pageSize) {
    query['pagination[pageSize]'] = params.pageSize.toString();
  }
  if (params?.sort) {
    query['sort'] = params.sort;
  }

  if (params?.locale) {
    query['filters[locale][$eq]'] = params.locale;
  }

  return fetchApi<{ data: StrapiEntity<StrapiArticle>[] }>({
    endpoint: 'articles',
    query,
  });
}

export async function getCommuniques(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  locale?: string;
}) {
  const query: Record<string, string> = {
    'populate': '*',
  };

  if (params?.page) {
    query['pagination[page]'] = params.page.toString();
  }
  if (params?.pageSize) {
    query['pagination[pageSize]'] = params.pageSize.toString();
  }
  if (params?.sort) {
    query['sort'] = params.sort;
  }

  if (params?.locale) {
    query['filters[locale][$eq]'] = params.locale;
  }

  return fetchApi<{ data: StrapiEntity<StrapiArticle>[] }>({
    endpoint: 'communiques',
    query,
  });
}

export function convertStrapiArticle(strapiPost: StrapiEntity<StrapiArticle> | any) {
  if (!strapiPost) {
    console.error('Strapi post is undefined or null');
    return null;
  }

  const attributes = strapiPost.attributes || strapiPost;

  if (!attributes.title) {
    console.error('Strapi post missing required fields:', strapiPost);
    return null;
  }

  const authorName = attributes.author?.data?.attributes?.name;

  const categoryName = attributes.category?.data?.attributes?.name;

  let content = '';
  if (attributes.blocks && Array.isArray(attributes.blocks)) {
    content = attributes.blocks.map((block: any) => {
      if (block.__component === 'shared.rich-text' && block.body) {
        let markdown = block.body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match: string, alt: string, url: string) => {
          const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
          return `![${alt}](${fullUrl})`;
        });

        const html = marked.parse(markdown, { async: false }) as string;

        return html.trim();
      }
      if (block.__component === 'shared.quote' && block.quote) {
        return `<blockquote>${block.quote}</blockquote>`;
      }
      if (block.__component === 'shared.media' && block.file) {
        const fileUrl = block.file?.data?.attributes?.url;
        if (fileUrl) {
          return `<img src="${STRAPI_URL}${fileUrl}" alt="${block.file.data.attributes.alternativeText || ''}" />`;
        }
      }
      return '';
    }).join('\n');
  }

  if (!content && attributes.description) {
    content = `<p>${attributes.description}</p>`;
  }
  
  return {
    id: strapiPost.id || 0,
    title: attributes.title,
    description: attributes.description || '',
    content: content,
    slug: attributes.slug || attributes.title?.toLowerCase().replace(/\s+/g, '-'),
    date: new Date(attributes.publishedAt || attributes.createdAt || new Date()),
    author: authorName,
    excerpt: attributes.description || '',
    categories: categoryName ? [categoryName] : [],
    tags: [],
    image: attributes.cover?.data?.attributes?.url 
      ? `${STRAPI_URL}${attributes.cover.data.attributes.url}`
      : undefined,
    locale: attributes.locale || 'en',
  };
}

export function convertStrapiCommunique(strapiPost: StrapiEntity<StrapiArticle> | any) {
  if (!strapiPost) {
    console.error('Strapi communique is undefined or null');
    return null;
  }

  const attributes = strapiPost.attributes || strapiPost;

  if (!attributes.title) {
    console.error('Strapi communique missing required fields:', strapiPost);
    return null;
  }

  const authorName = attributes.author?.data?.attributes?.name;

  const categoryName = attributes.category?.data?.attributes?.name;

  let content = '';
  if (attributes.blocks && Array.isArray(attributes.blocks)) {
    content = attributes.blocks.map((block: any) => {
      if (block.__component === 'shared.rich-text' && block.body) {
        let markdown = block.body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match: string, alt: string, url: string) => {
          const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
          return `![${alt}](${fullUrl})`;
        });
        const html = marked.parse(markdown, { async: false }) as string;
        return html.trim();
      }
      if (block.__component === 'shared.quote' && block.quote) {
        return `<blockquote>${block.quote}</blockquote>`;
      }
      if (block.__component === 'shared.media' && block.file) {
        const fileUrl = block.file?.data?.attributes?.url;
        if (fileUrl) {
          return `<img src="${STRAPI_URL}${fileUrl}" alt="${block.file.data.attributes.alternativeText || ''}" />`;
        }
      }
      return '';
    }).join('\n');
  }

  if (!content && attributes.description) {
    content = `<p>${attributes.description}</p>`;
  }

  return {
    id: strapiPost.id || 0,
    title: attributes.title,
    description: attributes.description || '',
    content: content,
    slug: attributes.slug || attributes.title?.toLowerCase().replace(/\s+/g, '-'),
    date: new Date(attributes.publishedAt || attributes.createdAt || new Date()),
    author: authorName,
    excerpt: attributes.description || '',
    categories: categoryName ? [categoryName] : [],
    tags: [],
    image: attributes.cover?.data?.attributes?.url 
      ? `${STRAPI_URL}${attributes.cover.data.attributes.url}`
      : undefined,
    locale: attributes.locale || 'en',
  };
}
