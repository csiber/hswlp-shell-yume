"use client";

import { useState, useRef} from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateRegistrationOptionsAction,
  verifyRegistrationAction,
  deletePasskeyAction,
} from "./passkey-settings.actions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useServerAction } from "zsa-react";
import { PASSKEY_AUTHENTICATOR_IDS } from "@/utils/passkey-authenticator-ids";
import { cn } from "@/lib/utils";
import type { ParsedUserAgent } from "@/types";

interface PasskeyRegistrationButtonProps {
  email: string;
  className?: string;
  onSuccess?: () => void;
}

function PasskeyRegistrationButton({ email, className, onSuccess }: PasskeyRegistrationButtonProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    try {
      setIsRegistering(true);

      // Get registration options from the server
      const [options] = await generateRegistrationOptionsAction({ email });

      if (!options) {
          throw new Error("Nem sikerült lekérni a regisztrációs beállításokat");
      }

      // Start the registration process in the browser
      const registrationResponse = await startRegistration({
        optionsJSON: options,
      });

      // Send the response back to the server for verification
      await verifyRegistrationAction({
        email,
        response: registrationResponse,
        challenge: options.challenge,
      });

        toast.success("Sikeres passkulcs-regisztráció");
      onSuccess?.();
      router.refresh();
    } catch (error) {
        console.error("Passkey registration error:", error);
        toast.error("Nem sikerült regisztrálni a passkulcsot");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Button
      onClick={handleRegister}
      disabled={isRegistering}
      className={className}
    >
        {isRegistering ? "Regisztráció..." : "Passkulcs regisztrálása"}
    </Button>
  );
}

interface Passkey {
  id: string;
  credentialId: string;
  userId: string;
  createdAt: Date;
  aaguid: string | null;
  userAgent: string | null;
  parsedUserAgent?: ParsedUserAgent;
}

interface PasskeysListProps {
  passkeys: Passkey[];
  currentPasskeyId: string | null;
  email: string | null;
}

export function PasskeysList({ passkeys, currentPasskeyId, email }: PasskeysListProps) {
  const router = useRouter();
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const { execute: deletePasskey } = useServerAction(deletePasskeyAction, {
    onSuccess: () => {
        toast.success("Passkulcs törölve");
      dialogCloseRef.current?.click();
      router.refresh();
    }
  });

  const isCurrentPasskey = (passkey: Passkey) =>
    passkey.credentialId === currentPasskeyId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Passkulcsok</h2>
          <p className="text-sm text-muted-foreground">
            Kezeld a jelszó nélküli bejelentkezéshez használt passkulcsaidat.
          </p>
        </div>
        {email && (
          <PasskeyRegistrationButton
            email={email}
            className="w-full sm:w-auto"
          />
        )}
      </div>

      <div className="space-y-4">
        {passkeys.map((passkey) => (
          <Card key={passkey.id} className={cn(!isCurrentPasskey(passkey) ? "bg-card/40" : "border-3 border-primary/20 shadow-lg bg-secondary/30")}>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                      {passkey.aaguid && (PASSKEY_AUTHENTICATOR_IDS as Record<string, string>)[passkey.aaguid] || "Ismeretlen hitelesítő alkalmazás"}
                      {isCurrentPasskey(passkey) && <Badge>Aktív passkulcs</Badge>}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        · {formatDistanceToNow(passkey.createdAt)} ezelőtt
                    </div>
                  </div>
                  {passkey.parsedUserAgent && (
                    <CardDescription className="text-sm">
                      {passkey.parsedUserAgent.browser.name ?? "Ismeretlen böngésző"} {passkey.parsedUserAgent.browser.major ?? "Ismeretlen verzió"} - {passkey.parsedUserAgent.device.vendor ?? "Ismeretlen eszköz"} {passkey.parsedUserAgent.device.model ?? "Ismeretlen modell"} {passkey.parsedUserAgent.device.type ?? "Ismeretlen típus"} ({passkey.parsedUserAgent.os.name ?? "Ismeretlen OS"} {passkey.parsedUserAgent.os.version ?? "Ismeretlen verzió"})
                    </CardDescription>
                  )}
                </div>
                <div>
                  {!isCurrentPasskey(passkey) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="w-full sm:w-auto">Passkulcs törlése</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Passkulcs törlése?</DialogTitle>
                          <DialogDescription>
                            Ez eltávolítja ezt a passkulcsot a fiókodból. A művelet nem vonható vissza.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-6 sm:mt-0">
                          <DialogClose ref={dialogCloseRef} asChild>
                              <Button variant="outline">Mégse</Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            className="mb-4 sm:mb-0"
                            onClick={() => deletePasskey({ credentialId: passkey.credentialId })}
                          >
                            Passkulcs törlése
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {passkeys.length === 0 && (
          <div className="text-center text-muted-foreground">
            Nincs még passkulcsod. Adj hozzá egyet a jelszó nélküli bejelentkezéshez.
          </div>
        )}
      </div>
    </div>
  );
}
