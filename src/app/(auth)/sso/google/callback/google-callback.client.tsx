"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useServerAction } from "zsa-react";
import { googleSSOCallbackAction } from "./google-callback.action";
import { googleSSOCallbackSchema } from "@/schemas/google-sso-callback.schema";
import { Spinner } from "@/components/ui/spinner";
import { REDIRECT_AFTER_SIGN_IN } from "@/constants";

export default function GoogleCallbackClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const hasCalledCallback = useRef(false);

  const { execute: handleCallback, isPending, error } = useServerAction(googleSSOCallbackAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || "Nem sikerült bejelentkezni Google-lel");
    },
    onStart: () => {
      toast.loading("Bejelentkezés Google-lel...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Sikeres bejelentkezés");
      window.location.href = REDIRECT_AFTER_SIGN_IN;
    },
  });

  useEffect(() => {
    if (code && state && !hasCalledCallback.current) {
      const result = googleSSOCallbackSchema.safeParse({ code, state });
      if (result.success) {
        hasCalledCallback.current = true;
        handleCallback(result.data);
      } else {
        toast.error("Érvénytelen visszahívási paraméterek");
        router.push("/sign-in");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, state]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="large" />
              <CardTitle>Bejelentkezés Google-lel</CardTitle>
              <CardDescription>
                Kérjük, várj amíg befejezzük a bejelentkezést...
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sikertelen bejelentkezés</CardTitle>
            <CardDescription>
              {error?.message || "Nem sikerült bejelentkezni Google-lel"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/sign-in")}
            >
              Vissza a bejelentkezéshez
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Érvénytelen visszahívás</CardTitle>
          <CardDescription>
            A bejelentkezési visszahívás érvénytelen vagy lejárt. Próbáld újra a bejelentkezést.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-in")}
          >
            Vissza a bejelentkezéshez
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

