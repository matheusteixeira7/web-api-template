"use client";

import { useState } from "react";
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";

import { useRegister } from "@/hooks/use-register";
import { api, ApiError } from "@/lib/api";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { mutate: register, isPending, error } = useRegister();

  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Validate password length
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    register({ name, email, password });
  }

  async function handleGoogleRegister() {
    setIsGoogleLoading(true);
    try {
      const { url } = await api<{ url: string }>("/auth/google/url");
      window.location.href = url;
    } catch {
      setIsGoogleLoading(false);
    }
  }

  const errorMessage =
    validationError ||
    (error instanceof ApiError && error.status === 409
      ? "An account with this email already exists"
      : error
        ? "An error occurred. Please try again."
        : null);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>
            Registre-se com Google ou crie uma conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={isGoogleLoading || isPending}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isGoogleLoading ? "Redirecionando..." : "Registrar com Google"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Ou continue com
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                  minLength={6}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
              </Field>
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Criando conta..." : "Criar conta"}
                </Button>
                <FieldDescription className="text-center">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="underline">
                    Fazer login
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Ao continuar, você concorda com nossos{" "}
        <a href="#" className="underline">
          Termos de Serviço
        </a>{" "}
        e{" "}
        <a href="#" className="underline">
          Política de Privacidade
        </a>
        .
      </FieldDescription>
    </div>
  );
}
