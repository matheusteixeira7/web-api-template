"use client";

import { useState } from "react";
import { GalleryVerticalEnd, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";

import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError("Ocorreu um erro. Tente novamente.");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>

        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Esqueceu sua senha?</CardTitle>
              <CardDescription>
                {isSuccess
                  ? "Verifique seu email"
                  : "Digite seu email para receber um link de recuperação"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="flex flex-col gap-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Se existe uma conta com o email <strong>{email}</strong>,
                    você receberá um link para redefinir sua senha.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para Login
                    </Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </Field>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Field>
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                      </Button>
                    </Field>
                    <Field>
                      <Button asChild variant="ghost" className="w-full">
                        <Link href="/login">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Voltar para Login
                        </Link>
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
