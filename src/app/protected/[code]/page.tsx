"use client";

import { useState } from "react";
import Button from "~/components/ui/button";

export default function ProtectedLinkPage({
  params,
}: {
  params: { code: string };
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      window.location.href = `/${params.code}?password=${encodeURIComponent(password)}`;
    } catch (err) {
      setError("Invalid password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Password Required
          </h2>
          <p className="mt-2 text-muted-foreground">
            This link is password protected
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Access Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
