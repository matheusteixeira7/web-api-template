"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { LogOut, Loader2 } from "lucide-react";
import { useSession } from "@/hooks/use-session";

export function LogoutButton() {
  const { signOut } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Saindo...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </>
      )}
    </Button>
  );
}
