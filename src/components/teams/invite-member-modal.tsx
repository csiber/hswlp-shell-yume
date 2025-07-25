"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerAction } from "zsa-react";
import { inviteUserAction } from "@/actions/team-membership-actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema with validation
const formSchema = z.object({
  email: z
    .string()
    .email("Kérjük, érvényes email címet adj meg")
    .min(1, "Az email megadása kötelező")
});

type FormValues = z.infer<typeof formSchema>;

interface InviteMemberModalProps {
  teamId: string;
  trigger: React.ReactNode;
  onInviteSuccess?: () => void;
}

export function InviteMemberModal({ teamId, trigger, onInviteSuccess }: InviteMemberModalProps) {
  const [open, setOpen] = useState(false);

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const { execute } = useServerAction(inviteUserAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || "Nem sikerült meghívni a felhasználót");
      console.error("Invite error:", error);
    },
    onStart: () => {
      toast.loading("Meghívó küldése...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("A meghívó sikeresen elküldve");
      form.reset();

      if (onInviteSuccess) {
        onInviteSuccess();
      }

      // Close the modal after a short delay
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    }
  });

  const onSubmit = async (data: FormValues) => {
    execute({
      teamId,
      email: data.email,
      roleId: "member", // Default role
      isSystemRole: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Csapattag meghívása</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email cím</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit">
                Send invite
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
