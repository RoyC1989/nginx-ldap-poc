import { assertEquals, assert} from "jsr:@std/assert@~1.0.0";
import { createApp } from "./server.ts";

Deno.test("Protected service serves index.html", async () => {
  const app = createApp();
  const ac = new AbortController();
  const server = Deno.serve({ port: 8000, signal: ac.signal }, app.fetch);

  // Wait a moment for the server to start
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const response = await fetch("http://localhost:8000/index.html");
    assertEquals(response.status, 200);
    const text = await response.text();
    assert(text.includes("Protected Service!"));
  } finally {
    ac.abort();
    server.shutdown();
  }
});