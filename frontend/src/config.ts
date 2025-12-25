export interface SiteConfig {
  title: {
    en: string;
    ar: string;
  };
  description: string;
  author: {
    name: string;
    bio: string;
    avatar?: string;
  };
  social: {
    github?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
    substack?: string;
  };
  siteUrl: string;
}

export const config: SiteConfig = {
  title: {
    en: "Free Yemenis | POFYS",
    ar: "اليمنيون الأحرار"
  },
  description: "",
  author: {
    name: "POFYS",
    bio: "",
    // avatar: "/images/avatar.jpg" // Uncomment and add your avatar image to public/images/
  },
  social: {
    twitter: "https://twitter.com/free_yemenis",
    instagram: "https://instagram.com/free.yemenis",
    email: "contact@freeyemenis.org",
    substack: "https://theyemenite.substack.com/"
  },
  siteUrl: "https://freeyemenis.org"
};

// Export constants for SEO component
export const SITE_TITLE = config.title;
export const SITE_DESCRIPTION = config.description;