"use client";

import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Token de verificação não encontrado.");
      return;
    }

    async function verifyEmail() {
      try {
        await api("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        setStatus("success");
      } catch (error) {
        setStatus("error");
        if (error instanceof ApiError) {
          if (error.status === 400) {
            setErrorMessage("Token inválido ou expirado.");
          } else {
            setErrorMessage("Ocorreu um erro ao verificar o email.");
          }
        } else {
          setErrorMessage("Ocorreu um erro ao verificar o email.");
        }
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verificação de Email</CardTitle>
          <CardDescription>
            {status === "loading" && "Verificando seu email..."}
            {status === "success" && "Email verificado com sucesso!"}
            {status === "error" && "Falha na verificação"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center text-sm text-muted-foreground">
                Seu email foi verificado. Agora você pode fazer login na sua
                conta.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Ir para Login</Link>
              </Button>
            </>
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
