export const config = {
  site: {
    name: process.env["NEXT_PUBLIC_SITE_NAME"] || "Priory",
    url: process.env["NEXT_PUBLIC_SITE_URL"] || "http://localhost:2009",
    description:
      process.env["NEXT_PUBLIC_SITE_DESCRIPTION"] || "Made with ♡ by",
    repo:
      process.env["NEXT_PUBLIC_SITE_REPO"] ||
      "https://github.com/priory-io/www.git",
  },
  social: {
    github:
      process.env["NEXT_PUBLIC_SOCIAL_GITHUB"] ||
      "https://github.com/priory-io",
    discord:
      process.env["NEXT_PUBLIC_SOCIAL_DISCORD"] || "https://discord.gg/priory",
  },
  features: {
    enableAnalaytics: process.env["ANALYTICS_ENABLE"],
    bypassInvitesInDev: process.env["NODE_ENV"] === "development",
    dashboardAccountPreferences:
      process.env["NEXT_PUBLIC_DASHBOARD_ACCOUNT_PREFERENCES"] === "1",
  },
  api: {
    baseUrl: process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:2009/api",
  },
  storage: {
    type: (process.env["STORAGE_TYPE"] as "r2" | "local") || "r2",
    maxFileSize: parseInt(process.env["MAX_FILE_SIZE"] || "104857600", 10),
  },
  r2: {
    accountId: process.env["R2_ACCOUNT_ID"],
    accessKeyId: process.env["R2_ACCESS_KEY_ID"],
    secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"],
    bucketName: process.env["R2_BUCKET_NAME"],
    publicUrl: process.env["R2_PUBLIC_URL"],
  },
  localStorage: {
    basePath: process.env["LOCAL_STORAGE_PATH"] || "/var/priory/files",
    uploadsPath: process.env["LOCAL_UPLOADS_PATH"] || "/files/uploads",
  },
} as const;

export type Config = typeof config;
