"use client";

import { signUpAction } from "./sign-up.actions";
import { type SignUpSchema, signUpSchema } from "@/schemas/signup.schema";
import { type PasskeyEmailSchema, passkeyEmailSchema } from "@/schemas/passkey.schema";
import { startPasskeyRegistrationAction, completePasskeyRegistrationAction } from "./passkey-sign-up.actions";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SeparatorWithText from "@/components/separator-with-text";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Captcha } from "@/components/captcha";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import Link from "next/link";
import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { KeyIcon } from 'lucide-react'
import { useConfigStore } from "@/state/config";
import { REDIRECT_AFTER_SIGN_IN } from "@/constants";

interface SignUpClientProps {
  redirectPath: string;
  referrerId?: string;
}

const SignUpPage = ({ redirectPath, referrerId }: SignUpClientProps) => {
  const { isTurnstileEnabled } = useConfigStore();
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const { execute: signUp } = useServerAction(signUpAction, {
    onError: (error) => {
      toast.dismiss()
      toast.error(error.err?.message)
    },
    onStart: () => {
      toast.loading("Fiók létrehozása folyamatban...")
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success("Sikeres fióklétrehozás")
      if (typeof window !== 'undefined') {
        localStorage.setItem('newcomer_badge_toast', '1')
      }
      window.location.href = redirectPath || REDIRECT_AFTER_SIGN_IN
    }
  })

  const { execute: completePasskeyRegistration } = useServerAction(completePasskeyRegistrationAction, {
    onError: (error) => {
      toast.dismiss()
      toast.error(error.err?.message)
      setIsRegistering(false)
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success("Sikeres fióklétrehozás")
      if (typeof window !== 'undefined') {
        localStorage.setItem('newcomer_badge_toast', '1')
      }
      window.location.href = redirectPath || REDIRECT_AFTER_SIGN_IN
    }
  })

  const { execute: startPasskeyRegistration } = useServerAction(startPasskeyRegistrationAction, {
    onError: (error) => {
      toast.dismiss()
      toast.error(error.err?.message)
      setIsRegistering(false)
    },
    onStart: () => {
      toast.loading("Passkey regisztráció indítása...")
      setIsRegistering(true)
    },
    onSuccess: async (response) => {
      toast.dismiss()
      if (!response?.data?.optionsJSON) {
        toast.error("Nem sikerült elindítani a passkey regisztrációt")
        setIsRegistering(false)
        return;
      }

      try {
        const attResp = await startRegistration({
          optionsJSON: response.data.optionsJSON,
          useAutoRegister: true,
        });
        await completePasskeyRegistration({ response: attResp });
      } catch (error: unknown) {
      console.error("Nem sikerült regisztrálni a passkey-t:", error);
      toast.error("Nem sikerült regisztrálni a passkey-t")
        setIsRegistering(false)
      }
    }
  })

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const passkeyForm = useForm<PasskeyEmailSchema>({
    resolver: zodResolver(passkeyEmailSchema),
  });

  const captchaToken = useWatch({ control: form.control, name: 'captchaToken' });
  const passkeyCaptchaToken = useWatch({ control: passkeyForm.control, name: 'captchaToken' });

  const onSubmit = async (data: SignUpSchema) => {
    signUp({ ...data, referrerId })
  }

  const onPasskeySubmit = async (data: PasskeyEmailSchema) => {
    startPasskeyRegistration({ ...data, referrerId })
  }

  return (
    <div className="min-h-[90vh] flex items-center px-4 justify-center bg-background my-6 md:my-10">
      <div className="w-full max-w-md space-y-8 p-6 md:p-10 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <h2 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Hozz létre új fiókot
          </h2>
          <p className="mt-2 text-muted-foreground">
            Van már fiókod?{" "}
            <Link href={`/sign-in?redirect=${encodeURIComponent(redirectPath)}`} className="font-medium text-primary hover:text-primary/90 underline">
              Jelentkezz be
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => setIsPasskeyModalOpen(true)}
          >
            <KeyIcon className="w-5 h-5 mr-2" />
            Regisztráció Passkey-jel
          </Button>
        </div>

        <SeparatorWithText>
          <span className="uppercase text-muted-foreground">Vagy</span>
        </SeparatorWithText>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email cím"
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
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Keresztnév"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Vezetéknév"
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
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Nicknév (opcionális)"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Jelszó újra"
                      className="w-full px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col justify-center items-center">
              <Captcha
                onSuccess={(token) => form.setValue('captchaToken', token)}
                validationError={form.formState.errors.captchaToken?.message}
              />

              <Button
                type="submit"
                className="w-full flex justify-center py-2.5 mt-8"
                disabled={Boolean(isTurnstileEnabled && !captchaToken)}
              >
                Fiók létrehozása jelszóval
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6">
          <p className="text-xs text-center text-muted-foreground">
            A regisztrációval elfogadod a{" "}
            <Link href="/terms" className="font-medium text-primary hover:text-primary/90 underline">
              Felhasználási feltételeket
            </Link>{" "}
            és a{" "}
            <Link href="/privacy" className="font-medium text-primary hover:text-primary/90 underline">
              Adatkezelési tájékoztatót
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={isPasskeyModalOpen} onOpenChange={setIsPasskeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regisztráció Passkey-jel</DialogTitle>
          </DialogHeader>
          <Form {...passkeyForm}>
            <form onSubmit={passkeyForm.handleSubmit(onPasskeySubmit)} className="space-y-6 mt-6">
              <FormField
                control={passkeyForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                          placeholder="Email cím"
                        className="w-full px-3 py-2"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passkeyForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                          placeholder="Keresztnév"
                        className="w-full px-3 py-2"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passkeyForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                          placeholder="Vezetéknév"
                        className="w-full px-3 py-2"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passkeyForm.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Nicknév (opcionális)"
                        className="w-full px-3 py-2"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-center items-center">
                <Captcha
                  onSuccess={(token) => passkeyForm.setValue('captchaToken', token)}
                  validationError={passkeyForm.formState.errors.captchaToken?.message}
                />

                <Button
                  type="submit"
                  className="w-full mt-8"
                  disabled={isRegistering || Boolean(isTurnstileEnabled && !passkeyCaptchaToken)}
                >
                  {isRegistering ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Regisztráció...
                    </>
                  ) : (
                    "Folytatás"
                  )}
                </Button>
              </div>
              {!isRegistering && (
                <p className="text-xs text-muted text-center mt-4">
                  A folytatás után a böngésző felkér egy Passkey létrehozására és mentésére, így a jövőben jelszó nélkül tudsz majd bejelentkezni.
                </p>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignUpPage;
