"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(1, "Kötelező"),
  description: z.string().optional(),
  tags: z.string().optional(),
  note: z.string().optional(),
});

export interface UploadForEdit {
  id: string;
  title: string;
  description?: string | null;
  tags?: string | null;
  note?: string | null;
}

interface Props {
  upload: UploadForEdit;
  trigger: React.ReactNode;
  onSaved: () => void;
}

export default function EditUploadDialog({ upload, trigger, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: upload.title,
      description: upload.description || "",
      tags: upload.tags || "",
      note: upload.note || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const res = await fetch(`/api/uploads/${upload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Sikeresen mentve");
      onSaved();
      setOpen(false);
    } else if (res.status === 402) {
      toast.error("Nincs elég kredit");
    } else {
      toast.error("Hiba történt");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fájl szerkesztése</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cím</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leírás / Prompt</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagek</FormLabel>
                  <FormControl>
                    <Input placeholder="tag1, tag2" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privát megjegyzés</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
              <Button type="submit">Mentés</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
