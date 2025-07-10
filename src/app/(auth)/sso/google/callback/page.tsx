import { Metadata } from "next";
import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import GoogleCallbackClientComponent from "./google-callback.client";
import { REDIRECT_AFTER_SIGN_IN } from "@/constants";

export const metadata: Metadata = {
  title: "Bejelentkezés Google-lel",
  description: "Google-bejelentkezés befejezése",
};

export default async function GoogleCallbackPage() {
  const session = await getSessionFromCookie();

  if (session) {
    return redirect(REDIRECT_AFTER_SIGN_IN);
  }

  return <GoogleCallbackClientComponent />;
}
