"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api, ApiError } from "@/lib/api";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      api<LoginResponse>("/sessions", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: () => {
      router.push("/dashboard");
    },
  });
}

export { ApiError };
