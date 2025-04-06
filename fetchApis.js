import fetch from "node-fetch";
import apiCache from "./utils/cache.js";

const endpoints = [
  {
    url: "https://trendgpt-backend.onrender.com/scrape/github-repositories",
    source: "GitHub",
  },
  {
    url: "https://trendgpt-backend.onrender.com/scrape/github-developers",
    source: "GitHub Developer",
  },
  {
    url: "https://ai-discovery-agent-frontend.onrender.com/api/papers",
    source: "Hugging face research papers",
  },
  {
    url: "https://fetch-url.onrender.com/fetch-url?url=https://huggingface.co/api/trending?limit=10&type=all&isapi=1",
    source: "HuggingFace",
  },
];

export async function fetchAllApiData() {
  const allData = [];
  
  // Create a cache key for all API data
  const cacheKey = 'all_api_data';
  
  // Check if we have cached API data
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log("📦 Using cached API data (valid for 10 minutes)");
    return cachedData;
  }
  
  console.log("🔄 No valid API cache found, fetching fresh data...");

  for (const api of endpoints) {
    try {
      // Create a cache key for each individual API
      const apiCacheKey = `api_${api.source.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Check if we have cached data for this specific API
      const cachedApiData = apiCache.get(apiCacheKey);
      let data;
      
      if (cachedApiData) {
        console.log(`📦 Using cached data for ${api.source}`);
        data = cachedApiData;
      } else {
        console.log(`🔄 Fetching fresh data for ${api.source}...`);
        const res = await fetch(api.url);
        data = await res.json();
        
        // Cache the raw API response for this specific endpoint
        apiCache.set(apiCacheKey, data);
      }

      const items = Array.isArray(data) ? data.slice(0, 5) : [];

      const formatted = items.map((item) => ({
        title: item.title || item.name || item.id || "No Title",
        description: item.description || item.content || "No Description",
        url: item.url || item.link || item.repo_url || "",
        source: api.source,
      }));

      allData.push(...formatted);
    } catch (error) {
      console.error(`❌ Failed to fetch ${api.source}:`, error.message);
    }
  }
  
  // Cache the combined and formatted data from all APIs
  apiCache.set(cacheKey, allData);

  return allData;
}
