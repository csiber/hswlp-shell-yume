import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Use the default dummy cache implementations to reduce bundle size
export default defineCloudflareConfig({
  enableCacheInterception: false
});
