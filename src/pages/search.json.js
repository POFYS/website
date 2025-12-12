export async function GET() {
  try {
    const { getArticles, convertStrapiArticle } = await import('../utils/strapi');

    const [enResponse, arResponse] = await Promise.all([
      getArticles({ locale: 'en', pageSize: 100 }),
      getArticles({ locale: 'ar', pageSize: 100 })
    ]);

    const enArticles = (enResponse?.data || []).map(entity => {
      const article = convertStrapiArticle(entity);
      if (!article) return null;
      return {
        title: article.title,
        url: `/articles/${article.slug}`,
        date: article.date instanceof Date ? article.date.toISOString() : article.date,
        excerpt: article.excerpt || '',
        categories: article.categories || [],
        locale: 'en'
      };
    }).filter(Boolean);

    const arArticles = (arResponse?.data || []).map(entity => {
      const article = convertStrapiArticle(entity);
      if (!article) return null;
      return {
        title: article.title,
        url: `/ar/articles/${article.slug}`,
        date: article.date instanceof Date ? article.date.toISOString() : article.date,
        excerpt: article.excerpt || '',
        categories: article.categories || [],
        locale: 'ar'
      };
    }).filter(Boolean);

    const searchData = [...enArticles, ...arArticles].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return new Response(JSON.stringify(searchData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {

    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
}