import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://astriks.duckdns.org/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Add dynamic routes by fetching data here
  ]
}
