// @ts-ignore `.open-next/worker.js` is generated at build time.
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  async scheduled(controller, _env, ctx) {
    console.log(`Scheduled job triggered for cron: ${controller.cron}`);

    // Placeholder for future internal Next.js API calls.
    ctx.waitUntil(Promise.resolve());
  },
} satisfies ExportedHandler<CloudflareEnv>;
