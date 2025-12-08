"use client";

import { Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { api, ApiError } from "@/lib/api";

type Status = "loading" | "error";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMessage("Código de autorização não encontrado.");
      return;
    }

    async function handleCallback() {
      try {
        const redirectUri = `${window.location.origin}/auth/callback/google`;

        await api("/auth/google/callback", {
          method: "POST",
          body: JSON.stringify({ code, redirectUri }),
        });

        // Redireciona para dashboard após login bem-sucedido
        router.push("/dashboard");
      } catch (error) {
        setStatus("error");
        if (error instanceof ApiError) {
          if (error.status === 400) {
            setErrorMessage("Falha na autenticação com Google. Tente novamente.");
          } else if (error.status === 401) {
            setErrorMessage("Código de autorização inválido ou expirado.");
          } else {
            setErrorMessage("Ocorreu um erro na autenticação.");
          }
        } else {
          setErrorMessage("Ocorreu um erro na autenticação.");
        }
      }
    }

    handleCallback();
  }, [code, router]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {status === "loading" ? "Autenticando..." : "Falha na autenticação"}
          </CardTitle>
          <CardDescription>
            {status === "loading"
              ? "Conectando com sua conta Google"
              : "Não foi possível completar o login"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-sm text-destructive">
                {errorMessage}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">Voltar para Login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
