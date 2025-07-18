"use client";

import type { Route } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { createTeamAction } from "@/actions/team-actions";

const formSchema = z.object({
  name: z.string().min(1, "A csapat neve kötelező").max(100, "A csapat neve túl hosszú"),
  description: z.string().max(1000, "A leírás túl hosszú").optional(),
  avatarUrl: z.string().url("Érvénytelen URL").max(600, "Az URL túl hosszú").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTeamForm() {
  const router = useRouter();

  const { execute: createTeam } = useServerAction(createTeamAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || "Nem sikerült létrehozni a csapatot");
    },
    onStart: () => {
      toast.loading("Csapat létrehozása...");
    },
    onSuccess: (result) => {
      toast.dismiss();
      toast.success("A csapat sikeresen létrejött");
      router.push(`/dashboard/teams/${result.data.data.slug}` as Route);
      router.refresh();
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      avatarUrl: "",
    },
  });

  function onSubmit(data: FormValues) {
    // Clean up empty string in avatarUrl if present
    const formData = {
      ...data,
      avatarUrl: data.avatarUrl || undefined
    };

    createTeam(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Csapat neve</FormLabel>
              <FormControl>
                <Input placeholder="Add meg a csapat nevét" {...field} />
              </FormControl>
              <FormDescription>
                Egyedi név a csapatod számára
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leírás</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Adj egy rövid leírást a csapatodról"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Opcionális leírás a csapat céljáról
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Csapat létrehozása
        </Button>
      </form>
    </Form>
  );
}
