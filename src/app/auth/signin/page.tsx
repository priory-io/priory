"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Github, Key } from "lucide-react";
import Button from "~/components/ui/button";
import Typography from "~/components/ui/typography";
import { authClient } from "~/lib/auth-client";
import { config } from "~/lib/config";
import {
  emailSchema,
  nameSchema,
  authPasswordSchema,
} from "~/lib/input-validation";

function formatAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("email") &&
    normalized.includes("already") &&
    normalized.includes("exist")
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (normalized.includes("invalid credentials")) {
    return "Incorrect email or password. Please try again.";
  }

  if (normalized.includes("password") && normalized.includes("too short")) {
    return "Password must be at least 8 characters.";
  }

  if (normalized.includes("password") && normalized.includes("too long")) {
    return "Password is too long. Use at most 128 characters.";
  }

  if (normalized.includes("email") && normalized.includes("not verified")) {
    return "Please verify your email address before signing in.";
  }

  return "An unexpected error occurred. Please try again.";
}

export default function SignInPage() {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isOauthLoading, setIsOauthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [oauthInviteCode, setOauthInviteCode] = useState("");
  const [showOauthInviteInput, setShowOauthInviteInput] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  if (config.features.maintenanceMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <Typography
                variant="h2"
                className="text-2xl font-bold text-foreground"
              >
                Under Construction
              </Typography>
              <Typography
                variant="muted"
                className="text-sm text-muted-foreground"
              >
                The authentication system is temporarily unavailable. Please
                check back soon.
              </Typography>
            </div>

            <Link
              href="/"
              className="block text-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedInviteCode = inviteCode.trim();

    if (isSignUp) {
      const nameResult = nameSchema.safeParse(trimmedName);

      if (!nameResult.success) {
        const firstIssue = nameResult.error.issues[0];

        setError(firstIssue?.message || "Invalid name");
        return;
      }

      if (!trimmedInviteCode) {
        setError("Invite code is required for signup");
        return;
      }
    }

    const emailResult = emailSchema.safeParse(trimmedEmail);

    if (!emailResult.success) {
      const firstIssue = emailResult.error.issues[0];

      setError(firstIssue?.message || "Invalid email");
      return;
    }

    const passwordResult = authPasswordSchema.safeParse(password);

    if (!passwordResult.success) {
      const firstIssue = passwordResult.error.issues[0];

      setError(
        firstIssue?.message ||
          "Invalid password. Password must be between 8 and 128 characters.",
      );
      return;
    }

    setIsEmailLoading(true);

    try {
      if (isSignUp) {
        const validateResponse = await fetch("/api/auth/validate-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode: trimmedInviteCode }),
        });

        if (!validateResponse.ok) {
          const data = await validateResponse.json();
          setError(data?.error || "Invalid invite code");
          return;
        }

        const { data, error } = await authClient.signUp.email({
          email: trimmedEmail,
          password,
          name: trimmedName,
        });

        if (error) {
          setError(
            error.message
              ? formatAuthErrorMessage(error.message)
              : "An unexpected error occurred. Please try again.",
          );
          return;
        }

        if (data?.user) {
          await fetch("/api/auth/consume-invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inviteCode: trimmedInviteCode,
              userId: data.user.id,
            }),
          });

          router.push("/dashboard");
        }
      } else {
        const { data, error } = await authClient.signIn.email({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setError(
            error.message
              ? formatAuthErrorMessage(error.message)
              : "An unexpected error occurred. Please try again.",
          );
          return;
        }

        if (data?.user) {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error(`Auth error: ${err}`);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    if (isSignUp && !showOauthInviteInput) {
      setShowOauthInviteInput(true);
      return;
    }

    if (isSignUp && !oauthInviteCode.trim()) {
      setError("Invite code is required for signup");
      return;
    }

    setIsOauthLoading(true);
    setError("");

    try {
      if (isSignUp && oauthInviteCode.trim()) {
        const validateResponse = await fetch("/api/auth/validate-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode: oauthInviteCode.trim() }),
        });

        if (!validateResponse.ok) {
          const data = await validateResponse.json();
          setError(data?.error || "Invalid invite code");
          setIsOauthLoading(false);
          return;
        }

        localStorage.setItem(
          "pendingInviteCode",
          oauthInviteCode?.trim() || "",
        );
      }

      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });

      if (error) {
        setError(error.message || "An unexpected error occurred");
        setIsOauthLoading(false);
      }
    } catch {
      setError("An unexpected error occurred");
      setIsOauthLoading(false);
    }
  };

  const resetOauthFlow = () => {
    setShowOauthInviteInput(false);
    setOauthInviteCode("");
    setError("");
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setInviteCode("");
    setOauthInviteCode("");
    setShowOauthInviteInput(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <Typography
              variant="h2"
              className="text-2xl font-bold text-foreground"
            >
              {isSignUp ? "Create Account" : "Welcome back"}
            </Typography>
            <Typography
              variant="muted"
              className="text-sm text-muted-foreground"
            >
              {isSignUp
                ? "Join Priory with an invite code"
                : "Sign in to your Priory account"}
            </Typography>
          </div>

          {error && (
            <motion.div
              className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && showOauthInviteInput && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-foreground">
                      Invite Code for GitHub signup
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={oauthInviteCode}
                        onChange={(e) => setOauthInviteCode(e.target.value)}
                        placeholder="Enter your invite code"
                        className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground"
                        autoFocus
                        maxLength={50}
                      />
                    </div>
                    <button
                      onClick={resetOauthFlow}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleGitHubAuth}
                disabled={isOauthLoading}
                variant="outline"
                className="w-full bg-card/30 backdrop-blur-sm hover:bg-card/50 border-border/60"
              >
                <Github className="w-4 h-4 mr-2" />
                {isOauthLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    Loading...
                  </div>
                ) : isSignUp && showOauthInviteInput ? (
                  "Continue with GitHub"
                ) : (
                  `${isSignUp ? "Sign up" : "Sign in"} with GitHub`
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="pb-1 pt-1.5 px-3 bg-primary-foreground rounded-xl text-muted-foreground font-mono">
                  OR CONTINUE WITH EMAIL
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground"
                    required
                    minLength={8}
                    maxLength={128}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use 8-128 characters for a strong password.
                  </p>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Invite Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter your invite code"
                      className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isEmailLoading}
                className="w-full"
                variant="primary"
              >
                {isEmailLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    Loading...
                  </div>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={handleToggleMode}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>

            <Link
              href="/"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
