export const config = {
  site: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Priory',
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:2009",
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Made with ♡ by",
    repo: process.env.NEXT_PUBLIC_SITE_REPO || "https://github.com/priory-io/www.git",
  },
  social: {
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB || "https://github.com/priory-io",
    discord: process.env.NEXT_PUBLIC_SOCIAL_DISCORD || "https://discord.gg/priory",
  },
  features: {
    enableAnalaytics: process.env.ANALYTICS_ENABLE,
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:2009/api",
  },
};

export type Config = typeof config;
