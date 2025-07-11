import { Metadata } from "next";
import { getSessionFromCookie } from "@/utils/auth";
import SignUpClientComponent from "./sign-up.client";
import { redirect } from "next/navigation";
import { REDIRECT_AFTER_SIGN_IN } from "@/constants";

export const metadata: Metadata = {
  title: "Regisztráció",
  description: "Új fiók létrehozása",
};

const SignUpPage = async ({
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

  return <SignUpClientComponent redirectPath={redirectPath} />
}

export default SignUpPage;
