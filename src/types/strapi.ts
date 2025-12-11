export interface StrapiImage {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
      thumbnail?: StrapiImageFormat;
      small?: StrapiImageFormat;
      medium?: StrapiImageFormat;
      large?: StrapiImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path?: string;
  url: string;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: StrapiPagination;
  };
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  articles?: any;
}

export interface StrapiArticle {
  title: string;
  slug: string;
  description?: string;
  cover?: {
    data?: StrapiImage;
  };
  author?: {
    data?: StrapiEntity<{
      name: string;
      email?: string;
    }>;
  };
  category?: {
    data?: StrapiCategory;
  };
  blocks?: any[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  locale?: string;
}

export interface StrapiQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  filters?: Record<string, any>;
  populate?: string | string[] | Record<string, any>;
  fields?: string[];
  publicationState?: 'live' | 'preview';
  locale?: string;
}
