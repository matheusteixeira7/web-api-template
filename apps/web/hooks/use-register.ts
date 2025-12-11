"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      api("/accounts", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: () => {
      router.push("/auth/login?registered=true");
    },
  });
}
