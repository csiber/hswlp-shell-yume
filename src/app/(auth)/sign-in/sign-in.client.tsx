"use client";

import { signInAction } from "./sign-in.actions";
import { type SignInSchema, signInSchema } from "@/schemas/signin.schema";
import { type ReactNode, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SeparatorWithText from "@/components/separator-with-text";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import Link from "next/link";
import SSOButtons from "../_components/sso-buttons";
import { KeyIcon } from "lucide-react";
import {
  generateAuthenticationOptionsAction,
  verifyAuthenticationAction,
} from "@/app/(settings)/settings/security/passkey-settings.actions";
import { startAuthentication } from "@simplewebauthn/browser";

interface SignInClientProps {
  redirectPath: string;
}

interface PasskeyAuthenticationButtonProps {
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  redirectPath: string;
}

function PasskeyAuthenticationButton({
  className,
  disabled,
  children,
  redirectPath,
}: PasskeyAuthenticationButtonProps) {
  const { execute: generateOptions } = useServerAction(
    generateAuthenticationOptionsAction,
    {
      onError: (error) => {
        toast.dismiss();
        toast.error(
          error.err?.message || "Nem sikerült lekérni a hitelesítési opciókat"
        );
      },
    }
  );

  const { execute: verifyAuthentication } = useServerAction(
    verifyAuthenticationAction,
    {
      onError: (error) => {
        toast.dismiss();
        toast.error(error.err?.message || "A hitelesítés nem sikerült");
      },
      onSuccess: () => {
        toast.dismiss();
        toast.success("Sikeres hitelesítés");
        window.location.href = redirectPath;
      },
    }
  );

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      toast.loading("Hitelesítés passkey-jel...");

      // Get authentication options from the server
      const [options] = await generateOptions({});

      if (!options) {
        throw new Error("Nem sikerült lekérni a hitelesítési opciókat");
      }

      // Start the authentication process in the browser
      const authenticationResponse = await startAuthentication({
        optionsJSON: options,
      });

      // Send the response back to the server for verification
      await verifyAuthentication({
        response: authenticationResponse,
        challenge: options.challenge,
      });
    } catch (error) {
      console.error("Passkey hitelesítési hiba:", error);
      toast.dismiss();
      toast.error("A hitelesítés nem sikerült");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button
      onClick={handleAuthenticate}
      disabled={isAuthenticating || disabled}
      className={className}
    >
      {isAuthenticating
        ? "Hitelesítés..."
        : children || "Bejelentkezés Passkey-jel"}
    </Button>
  );
}

const SignInPage = ({ redirectPath }: SignInClientProps) => {
  const { execute: signIn } = useServerAction(signInAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message);
    },
    onStart: () => {
      toast.loading("Bejelentkezés folyamatban...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Sikeres bejelentkezés");
      window.location.href = redirectPath;
    },
  });
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInSchema) => {
    signIn(data);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center px-4 justify-center bg-background my-6 md:my-10">
      <div className="w-full max-w-md space-y-8 p-6 md:p-10 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Jelentkezz be a fiókodba
          </h2>
          <p className="mt-2 text-muted-foreground">
            vagy{" "}
            <Link
              href={`/sign-up?redirect=${encodeURIComponent(redirectPath)}`}
              className="font-medium text-primary hover:text-primary/90 underline"
            >
              hozz létre új fiókot
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <SSOButtons isSignIn />

          <PasskeyAuthenticationButton
            className="w-full"
            redirectPath={redirectPath}
          >
            <KeyIcon className="w-5 h-5 mr-2" />
            Bejelentkezés Passkey-jel
          </PasskeyAuthenticationButton>
        </div>

        <SeparatorWithText>
          <span className="uppercase text-muted-foreground">Vagy</span>
        </SeparatorWithText>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email cím"
                      type="email"
                      className="w-full px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Jelszó"
                      className="w-full px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full flex justify-center py-2.5">
              Bejelentkezés jelszóval
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignInPage;
