"use client";

import { signInAction } from "./sign-in.actions";
import { type SignInSchema, signInSchema } from "@/schemas/signin.schema";


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


interface SignInClientProps {
  redirectPath: string;
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
