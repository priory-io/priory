"use client";

import { useState, useEffect } from "react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Upload via Phone
          </DialogTitle>
          <DialogDescription>
            Scan the QR code with your phone to upload files
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center p-4">
              <div className="w-64 h-64 flex items-center justify-center bg-white/10 rounded-xl">
                <QRCodeSVG
                  value={qrValue}
                  size={240}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Session expires in 30 minutes
              </p>
            </div>

            <div className="space-y-3 px-2">
              <div className="flex gap-2 items-center bg-card/50 border border-border/50 rounded-lg p-3 w-full">
                <div className="flex-1 min-w-0 text-center">
                  <p className="text-xs font-mono text-muted-foreground break-words">
                    {qrValue}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 p-1.5 hover:bg-primary/10 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center px-2">
                Or share this link directly
              </p>
            </div>

            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
