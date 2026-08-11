export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const redirect = encodeURIComponent(`${url.origin}/callback`);
      const scope = encodeURIComponent("repo");
      const state = crypto.randomUUID();
      return Response.redirect(
        `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(env.GITHUB_CLIENT_ID)}&redirect_uri=${redirect}&scope=${scope}&state=${state}`,
        302
      );
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", {status: 400});

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {"Accept": "application/json", "Content-Type": "application/json"},
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code
        })
      });
      const token = await tokenRes.json();
      if (!token.access_token) return new Response("OAuth token exchange failed", {status: 401});

      const payload = {token: token.access_token, provider: "github"};
      return new Response(
        `<script>window.opener.postMessage(${JSON.stringify(payload)}, "*"); window.close();</script>`,
        {headers: {"Content-Type": "text/html; charset=utf-8"}}
      );
    }

    return new Response("Decap OAuth worker", {status: 200});
  }
};
