import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
import { dirname, fromFileUrl, join, relative } from "https://deno.land/std/path/mod.ts";

export function createApp() {
  const app = new Hono();

  const __dirname = dirname(fromFileUrl(import.meta.url));
  const hostedFilesAbs = join(__dirname, "hostedFiles");

  const cwd = Deno.cwd();
  const hostedFilesRel = relative(cwd, hostedFilesAbs);

  console.log("Static serving from Absolute:", hostedFilesAbs);
  console.log("Static serving relative to CWD:", hostedFilesRel);

  app.use(
    "/*",
    serveStatic({
      root: hostedFilesRel,
    }),
  );

  return app;
}

// deno-coverage-ignore-start
if (import.meta.main) {
  const app = createApp();
  Deno.serve({ port: 8000 }, app.fetch);
}
// deno-coverage-ignore-stop