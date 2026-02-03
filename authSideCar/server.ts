import { Client } from "npm:ldapts@~8.0.0";
import { serve } from "https://deno.land/std/http/server.ts";

const LDAP_URL = "ldap://ldap:389";
const BASE_DN = "dc=example,dc=org";
const USER_DN_TEMPLATE = "cn={{username}},ou=users," + BASE_DN;
const ADMIN_DN = "cn=admin," + BASE_DN;
const ADMIN_PASSWORD = "adminpassword";

function parseBasicAuth(header: string | null) {
  if (!header || !header.startsWith("Basic ")) return null;

  const decoded = atob(header.slice(6));
  const [username, password] = decoded.split(":");

  if (!username || !password) return null;
  return { username, password };
}

async function authenticate(username: string, password: string): Promise<boolean> {
  const client = new Client({ url: LDAP_URL });

  try {
    // Bind as admin
    await client.bind(ADMIN_DN, ADMIN_PASSWORD);

    // Search for user
    const userDN = USER_DN_TEMPLATE.replace("{{username}}", username);
    const searchResult = await client.search(BASE_DN, {
      scope: 'sub',
      filter: `(cn=${username})`,
      attributes: ['dn']
    });

    let userExists = false;
    for (const entry of searchResult.searchEntries) {
      console.log('Entry found:', entry);
      if (entry.dn === userDN) {
        userExists = true;
        break;
      }
    }

    if (!userExists) {
      return false;
    }

    // Bind as user
    const userClient = new Client({ url: LDAP_URL });
    try {
      await userClient.bind(userDN, password);
      console.log("User bind successful for", userDN);
      return true;
    } catch (userErr) {
      console.log("User bind failed for", userDN, userErr);
      return false;
    } finally {
      await userClient.unbind();
    }
  } catch (err) {
    console.log("Admin bind or search error:", err);
    return false;
  } finally {
    await client.unbind();
  }
}

serve(async (req) => {
  const auth = parseBasicAuth(req.headers.get("authorization"));

  if (!auth) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="LDAP"',
      },
    });
  }
  
  console.log("AUTH REQUEST:", req.headers.get("authorization"));

  const ok = await authenticate(auth.username, auth.password);

  if (!ok) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="LDAP"',
      },
    });
  }

  return new Response("OK", {
    status: 200,
    headers: {
      "X-Authenticated-User": auth.username,
    },
  });
}, { port: 3000 });
