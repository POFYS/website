import rss from '@astrojs/rss';
import { config } from '../config';
import { getArticles, convertStrapiArticle, getCommuniques, convertStrapiCommunique } from '../utils/strapi';

export async function GET(context) {
  const [enResponse, arResponse] = await Promise.all([
    getArticles({ locale: 'en', pageSize: 100 }),
    getArticles({ locale: 'ar', pageSize: 100 }),
  ]);

  const enItems = (enResponse?.data || []).map((entity) => {
    const article = convertStrapiArticle(entity);
    if (!article) return null;
    return {
      title: article.title,
      pubDate: article.date instanceof Date ? article.date : new Date(article.date),
      description: article.excerpt || article.excerpt || '',
      link: `/articles/${article.slug}`,
    };
  }).filter(Boolean);

  const arItems = (arResponse?.data || []).map((entity) => {
    const article = convertStrapiArticle(entity);
    if (!article) return null;
    return {
      title: article.title,
      pubDate: article.date instanceof Date ? article.date : new Date(article.date),
      description: article.excerpt || '',
      link: `/ar/articles/${article.slug}`,
    };
  }).filter(Boolean);

  const [commEnResponse, commArResponse] = await Promise.all([
    getCommuniques({ locale: 'en', pageSize: 100 }),
    getCommuniques({ locale: 'ar', pageSize: 100 }),
  ]);

  const commEnItems = (commEnResponse?.data || []).map((entity) => {
    const comm = convertStrapiCommunique(entity);
    if (!comm) return null;
    return {
      title: comm.title,
      pubDate: comm.date instanceof Date ? comm.date : new Date(comm.date),
      description: comm.excerpt || '',
      link: `/communiques/${comm.slug}`,
    };
  }).filter(Boolean);

  const commArItems = (commArResponse?.data || []).map((entity) => {
    const comm = convertStrapiCommunique(entity);
    if (!comm) return null;
    return {
      title: comm.title,
      pubDate: comm.date instanceof Date ? comm.date : new Date(comm.date),
      description: comm.excerpt || '',
      link: `/ar/communiques/${comm.slug}`,
    };
  }).filter(Boolean);

  const items = [...enItems, ...arItems, ...commEnItems, ...commArItems].sort((a, b) => {
    const da = new Date(a.pubDate).getTime();
    const db = new Date(b.pubDate).getTime();
    return db - da;
  });

  return rss({
    title: config.title,
    description: config.description,
    site: context.site,
    items,
  });
}