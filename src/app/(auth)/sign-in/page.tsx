import { Metadata } from "next";
import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import SignInClientPage from "./sign-in.client";
import { REDIRECT_AFTER_SIGN_IN } from "@/constants";

export const metadata: Metadata = {
  title: "Bejelentkezés",
  description: "Lépj be a fiókodba",
};

const SignInPage = async ({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) => {
  const redirectParam = searchParams?.redirect;
  const session = await getSessionFromCookie();
  const redirectPath = redirectParam ?? REDIRECT_AFTER_SIGN_IN;

  if (session) {
    return redirect(redirectPath);
  }

  return (
    <SignInClientPage redirectPath={redirectPath} />
  )
}

export default SignInPage;
