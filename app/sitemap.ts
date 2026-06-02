import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://prognosel.se";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1.0, changeFrequency: "hourly" },
    { url: `${baseUrl}/elpriser/`, priority: 0.95, changeFrequency: "hourly" },
    { url: `${baseUrl}/elpriser/se1/`, priority: 0.9, changeFrequency: "hourly" },
    { url: `${baseUrl}/elpriser/se2/`, priority: 0.9, changeFrequency: "hourly" },
    { url: `${baseUrl}/elpriser/se3/`, priority: 0.9, changeFrequency: "hourly" },
    { url: `${baseUrl}/elpriser/se4/`, priority: 0.9, changeFrequency: "hourly" },
    { url: `${baseUrl}/prognos/`, priority: 0.85, changeFrequency: "hourly" },
    { url: `${baseUrl}/guide/`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${baseUrl}/guide/spotpris/`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/guide/elpriser-2025/`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/guide/billigaste-timmen/`, priority: 0.7, changeFrequency: "monthly" },
  ];

  return staticRoutes;
}
