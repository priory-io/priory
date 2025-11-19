import { Suspense } from "react";
import QRUploadContent from "./content";

export default function QRUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <QRUploadContent />
    </Suspense>
  );
}
