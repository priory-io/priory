"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Smartphone } from "lucide-react";
import Button from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
  const [isLoading, setIsLoading] = useState(!initialSessionToken);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialSessionToken && initialSessionId) {
      setSessionToken(initialSessionToken);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Smartphone className="w-5 h-5 text-primary" />
            </motion.div>
            Upload via Phone
          </DialogTitle>
          <DialogDescription>
            Scan the QR code with your phone to upload files
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm"
          >
            {error}
          </motion.div>
        ) : isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
          >
            <motion.div
              className="flex justify-center p-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                className="w-64 h-64 flex items-center justify-center bg-white/10 rounded-xl"
                whileHover={{ scale: 1.05 }}
                animate={{
                  scale: 1,
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.1)",
                    "0 0 0 20px rgba(59, 130, 246, 0)",
                  ],
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  },
                  scale: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                <QRCodeSVG value={qrValue} size={240} level="H" />
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-muted-foreground">
                Session expires in 30 minutes
              </p>
            </motion.div>

            <motion.div
              className="space-y-3 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="flex gap-2 items-center bg-card/50 border border-border/50 rounded-lg p-3 w-full"
                whileHover={{
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                  borderColor: "rgba(59, 130, 246, 0.3)",
                  scale: 1.02,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex-1 min-w-0 text-center">
                  <motion.p
                    className="text-xs font-mono text-muted-foreground break-words"
                    animate={{ opacity: [1, 0.8, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {qrValue}
                  </motion.p>
                </div>
                <motion.button
                  onClick={handleCopy}
                  className="flex-shrink-0 p-1.5 hover:bg-primary/10 rounded transition-colors"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              <motion.p
                className="text-xs text-muted-foreground text-center px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Or share this link directly
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
