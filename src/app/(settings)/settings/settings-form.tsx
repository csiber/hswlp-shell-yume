"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSessionStore } from "@/state/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export function SettingsForm() {
  const router = useRouter()

  const { session, isLoading } = useSessionStore();
  const nicknameSchema = z.object({
    nickname: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]{3,20}$/)
  })
  const form = useForm<z.infer<typeof nicknameSchema>>({
    resolver: zodResolver(nicknameSchema)
  });

  useEffect(() => {
    form.reset({ nickname: session?.user.nickname ?? '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  if (!session || isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-[200px]" />
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canChangeNickname =
    (session.user.currentCredits ?? 0) >= 50 &&
    (!session.user.nicknameUpdatedAt ||
      (Date.now() - new Date(session.user.nicknameUpdatedAt).getTime()) / (1000 * 60 * 60 * 24) > 30)

  async function onSubmit(values: z.infer<typeof nicknameSchema>) {
    if (!canChangeNickname) {
      toast.error('Not enough credits to change nickname.')
      return
    }
    toast.loading('Saving data...')
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      toast.dismiss()
      if (res.ok && data.success) {
        toast.success('Saved successfully')
        router.refresh()
      } else {
        toast.error(data.error || 'Error saving data')
      }
    } catch {
      toast.dismiss()
      toast.error('Network error while saving data')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil beállítások</CardTitle>
        <CardDescription>
          Személyes adataid és elérhetőségeid frissítése.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <FormLabel>Keresztnév</FormLabel>
              <Input disabled value={session.user.firstName ?? ''} />
            </div>
            <div className="space-y-2">
              <FormLabel>Vezetéknév</FormLabel>
              <Input disabled value={session.user.lastName ?? ''} />
            </div>
            <div className="col-span-2">
              <FormDescription>
                A teljes neved rejtve marad más felhasználók elől.
              </FormDescription>
            </div>
          </div>

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Felhasználónév / Nicknév</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    50 kreditbe kerül és 30 naponta egyszer módosítható.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormItem>
              <FormLabel>E-mail cím</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  disabled
                  value={session.user.email ?? ''}
                />
              </FormControl>
              <FormDescription>
                Ez az a e-mail cím, amellyel bejelentkezel.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <div className="flex justify-end">
              <Button type="submit" disabled={!canChangeNickname}>
                Változtatások mentése
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
