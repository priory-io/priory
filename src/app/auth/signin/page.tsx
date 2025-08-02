"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Github, Key } from "lucide-react";
import Button from "~/components/ui/button";
import Typography from "~/components/ui/typography";
import { authClient } from "~/lib/auth-client";

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError("");

    try {
      if (isSignUp) {
        if (!inviteCode.trim()) {
          setError("Invite code is required for signup");
          return;
        }

        const validateResponse = await fetch("/api/auth/validate-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode: inviteCode.trim() }),
        });

        if (!validateResponse.ok) {
          const data = await validateResponse.json();
          setError(data?.error || "Invalid invite code");
          return;
        }

        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.user) {
          await fetch("/api/auth/consume-invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inviteCode: inviteCode.trim(),
              userId: data.user.id,
            }),
          });

          router.push("/dashboard");
        }
      } else {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.user) {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
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

      const { data, error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });

      if (error) {
        setError(error.message || "An unexpected error occurred");
        setIsOauthLoading(false);
      }
    } catch (err) {
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
                        className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground backdrop-blur-sm"
                        autoFocus
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
                      className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground backdrop-blur-sm"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground backdrop-blur-sm"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground backdrop-blur-sm"
                    required
                  />
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
                      className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder-muted-foreground backdrop-blur-sm"
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
