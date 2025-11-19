"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Smartphone } from "lucide-react";
import Button from "~/components/ui/button";
import { config } from "~/lib/config";

interface QRUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken?: string;
  sessionId?: string;
  onSessionCreated?: (sessionToken: string, sessionId: string) => void;
}

export function QRUploadModal({
  isOpen,
  onClose,
  sessionToken: initialSessionToken,
  sessionId: initialSessionId,
  onSessionCreated,
}: QRUploadModalProps) {
  const [sessionToken, setSessionToken] = useState(initialSessionToken || "");
  const [sessionId, setSessionId] = useState(initialSessionId || "");
  const [isLoading, setIsLoading] = useState(!initialSessionToken);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialSessionToken && initialSessionId) {
      setSessionToken(initialSessionToken);
      setSessionId(initialSessionId);
      setIsLoading(false);
      return;
    }

    const createSession = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/files/qr-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to create QR session");
          return;
        }

        const data = await response.json();
        setSessionToken(data.sessionToken);
        setSessionId(data.id);
        onSessionCreated?.(data.sessionToken, data.id);
      } catch (err) {
        setError("Failed to create QR session");
        console.error("QR session creation error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    createSession();
  }, [isOpen, initialSessionToken, initialSessionId, onSessionCreated]);

  const qrValue = `${config.site.url}/qr-upload?session=${sessionToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-8 w-full h-full max-w-2xl max-h-[95vh] shadow-2xl flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Upload via Phone
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          {error ? (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-8 flex flex-col flex-1 justify-center">
              <div className="space-y-6">
                <div className="flex justify-center p-8 bg-white/10 rounded-xl">
                  <QRCodeSVG
                    value={qrValue}
                    size={356}
                    level="H"
                    includeMargin
                    className="w-full h-full max-w-sm"
                  />
                </div>

                <div className="text-center space-y-3">
                  <p className="text-base text-muted-foreground">
                    Scan this QR code with your phone to upload files
                  </p>
                  <p className="text-sm text-muted-foreground/60">
                    Session expires in 30 minutes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 items-center bg-card/50 border border-border/50 rounded-lg p-4">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-mono text-muted-foreground truncate">
                      {qrValue}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 p-2 hover:bg-primary/10 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Or share this link directly
                </p>
              </div>

              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
