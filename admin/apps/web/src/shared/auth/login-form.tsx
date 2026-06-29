"use client";

import { useState, type FormEvent } from "react";
import { Input, Button } from "@repo/ui";

export interface LoginFormProps {
  /** Llamado con email+password al enviar. Puede lanzar en error de auth. */
  onSubmit: (email: string, password: string) => Promise<void>;
}

/**
 * Formulario de login (email + password) construido con los atoms de @repo/ui.
 * Posee email, password, pending y error; delega la lógica de auth a onSubmit.
 * Un rechazo de onSubmit se muestra como mensaje de error en español.
 */
export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await onSubmit(email, password);
    } catch {
      setError("Credenciales inválidas. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex w-full max-w-xs flex-col gap-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
