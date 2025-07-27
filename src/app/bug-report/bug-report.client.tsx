"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const bugSchema = z.object({
  email: z.string().email(),
  description: z.string().min(10, "Please write at least 10 characters"),
});

export default function BugReportClient() {
  const form = useForm<z.infer<typeof bugSchema>>({
    resolver: zodResolver(bugSchema),
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(values: z.infer<typeof bugSchema>) {
    const fd = new FormData();
    fd.append("email", values.email);
    fd.append("description", values.description);
    if (file) fd.append("file", file);
    setSubmitting(true);
    try {
      const res = await fetch("/api/report-bug", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("failed");
      toast.success("Thank you! We received your bug report.");
      form.reset();
      setFile(null);
    } catch {
      toast.error("Failed to send the bug report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bug Report Form</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Describe the issue and steps to reproduce it. Please attach a screenshot if possible.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bug description</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Attachment (optional)</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button type="submit" disabled={submitting} className="flex items-center">
            {submitting ? (
              <>
                <Spinner size="small" className="mr-2" /> Sending...
              </>
            ) : (
              "Submit bug report"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

