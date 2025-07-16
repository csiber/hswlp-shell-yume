import { Google, generateState, generateCodeVerifier } from "arctic";
import ms from "ms";
import {
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME,
} from "@/constants";

interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NEXTJS_ENV: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  // mostantól env.NEXTJS_ENV hibamentes lesz

  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const baseUrl = new URL(request.url).origin;
    const callbackUrl = `${baseUrl}/sso/google/callback`;

    const google = new Google(
      env.GOOGLE_CLIENT_ID ?? "",
      env.GOOGLE_CLIENT_SECRET ?? "",
      callbackUrl
    );

    const ssoRedirectUrl = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    const isProd = env.NEXTJS_ENV === "production";
    const maxAge = Math.floor(ms("10 minutes") / 1000);
    const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge};${isProd ? " Secure" : ""}`;

    const headers = new Headers();
    headers.append("Set-Cookie", `${GOOGLE_OAUTH_STATE_COOKIE_NAME}=${state}; ${cookieOptions}`);
    headers.append("Set-Cookie", `${GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME}=${codeVerifier}; ${cookieOptions}`);
    headers.set("Location", ssoRedirectUrl.toString());

    return new Response(null, { status: 307, headers });
  } catch (error) {
    console.error("SSO hiba:", error);
    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  }
};
