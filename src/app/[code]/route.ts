import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { shortlink, shortlinkClick, file } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { config } from "~/lib/config";
import { createStorageProvider } from "~/lib/file-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;

    const fileRecord = await db
      .select()
      .from(file)
      .where(and(eq(file.id, code), eq(file.isActive, true)))
      .limit(1);

    if (fileRecord.length > 0) {
      const fileData = fileRecord[0]!;
      const storageProvider = createStorageProvider();
      const fileUrl = storageProvider.getFileUrl(
        `${fileData.userId}/${fileData.id}`,
      );

      const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith("image/"))
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m5 21 6.086-6.086a2 2 0 0 1 2.828 0L15 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/></svg>`;
        if (mimeType.startsWith("video/"))
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m22 8-6 4 6 4V8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2" stroke="currentColor" stroke-width="2"/></svg>`;
        if (mimeType.startsWith("audio/"))
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/></svg>`;
        if (mimeType.includes("pdf"))
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        if (mimeType.includes("zip") || mimeType.includes("archive"))
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M12 6h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 10h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 14h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      };

      const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      };

      const renderPreview = () => {
        if (fileData.mimeType.startsWith("image/")) {
          return `
          <div class="glass rounded-xl overflow-hidden shadow-lg">
            <img src="${fileUrl}" alt="${fileData.filename}" class="w-full max-w-[60vh] mx-auto h-auto max-h-[60vh] object-contain" />
          </div>
        `;
        }
        if (fileData.mimeType.startsWith("video/")) {
          return `
          <div class="glass rounded-xl overflow-hidden shadow-lg">
            <video src="${fileUrl}" controls class="w-full h-auto max-h-[60vh]">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
        }
        if (fileData.mimeType.startsWith("audio/")) {
          return `
          <div class="glass rounded-xl p-8 shadow-lg">
            <div class="flex flex-col items-center space-y-6">
              <div class="file-icon">
                ${getFileIcon(fileData.mimeType)}
              </div>
              <audio src="${fileUrl}" controls class="w-full max-w-md">
                Your browser does not support the audio tag.
              </audio>
            </div>
          </div>
        `;
        }
        return `
          <div class="glass rounded-xl p-12 shadow-lg">
            <div class="flex flex-col items-center space-y-6 text-center">
              <div class="file-icon">
                ${getFileIcon(fileData.mimeType)}
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Preview not available</h3>
                <p class="text-muted-foreground">This file type cannot be previewed in the browser</p>
              </div>
            </div>
          </div>
        `;
      };

      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="utf-8">
  <title>${fileData.filename} - Priory</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <meta property="og:title" content="${fileData.filename}">
  <meta property="og:description" content="File shared via Priory">
  <meta property="og:url" content="${request.url}">
  <meta property="og:site_name" content="Priory">
  
  ${
    fileData.mimeType.startsWith("image/")
      ? `
  <meta property="og:type" content="article">
  <meta property="og:image" content="${fileUrl}">
  <meta property="og:image:type" content="${fileData.mimeType}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  `
      : ""
  }
  
  ${
    fileData.mimeType.startsWith("video/")
      ? `
  <meta property="og:type" content="video.other">
  <meta property="og:video" content="${fileUrl}">
  <meta property="og:video:type" content="${fileData.mimeType}">
  `
      : ""
  }
  
  <meta name="twitter:card" content="${fileData.mimeType.startsWith("image/") ? "summary_large_image" : "summary"}">
  <meta name="twitter:title" content="${fileData.filename}">
  <meta name="twitter:description" content="File shared via Priory">
  ${fileData.mimeType.startsWith("image/") ? `<meta name="twitter:image" content="${fileUrl}">` : ""}
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'media',
      theme: {
        extend: {
          colors: {
            background: 'oklch(var(--background))',
            foreground: 'oklch(var(--foreground))',
            card: 'oklch(var(--card))',
            'card-foreground': 'oklch(var(--card-foreground))',
            primary: 'oklch(var(--primary))',
            'primary-foreground': 'oklch(var(--primary-foreground))',
            secondary: 'oklch(var(--secondary))',
            'secondary-foreground': 'oklch(var(--secondary-foreground))',
            muted: 'oklch(var(--muted))',
            'muted-foreground': 'oklch(var(--muted-foreground))',
            border: 'oklch(var(--border))',
            ring: 'oklch(var(--ring))',
          }
        }
      }
    }
  </script>
  <style>
    :root {
      --background: 1 0 0;
      --foreground: 0.145 0 0;
      --card: 1 0 0;
      --card-foreground: 0.145 0 0;
      --primary: 0.205 0 0;
      --primary-foreground: 0.985 0 0;
      --secondary: 0.97 0 0;
      --secondary-foreground: 0.205 0 0;
      --muted: 0.97 0 0;
      --muted-foreground: 0.556 0 0;
      --border: 0.922 0 0;
      --ring: 0.708 0 0;
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --background: 0.145 0 0;
        --foreground: 0.985 0 0;
        --card: 0.205 0 0;
        --card-foreground: 0.985 0 0;
        --primary: 0.922 0 0;
        --primary-foreground: 0.205 0 0;
        --secondary: 0.269 0 0;
        --secondary-foreground: 0.985 0 0;
        --muted: 0.269 0 0;
        --muted-foreground: 0.708 0 0;
        --border: 1 0 0 / 10%;
        --ring: 0.556 0 0;
      }
    }
    
    body { 
      font-family: 'Geist', ui-sans-serif, system-ui, sans-serif; 
      background-color: oklch(var(--background));
      color: oklch(var(--foreground));
    }
    
    .glass {
      background: oklch(var(--card) / 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid oklch(var(--border) / 0.2);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-center: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-family: inherit;
      white-space: nowrap;
      user-select: none;
      height: 2.5rem;
    }
    
    .btn:focus {
      outline: 2px solid oklch(var(--ring));
      outline-offset: 2px;
    }
    
    .btn-primary {
      background: oklch(var(--primary));
      color: oklch(var(--primary-foreground));
    }
    
    .btn-primary:hover {
      background: oklch(var(--primary) / 0.9);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px oklch(var(--primary) / 0.25);
    }
    
    .btn-secondary {
      background: oklch(var(--card) / 0.5);
      color: oklch(var(--foreground));
      border: 1px solid oklch(var(--border));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .btn-secondary:hover {
      background: oklch(var(--card) / 0.7);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px oklch(var(--border) / 0.25);
    }
    
    .copy-success {
      background: oklch(0.646 0.222 41.116) !important;
      color: white !important;
    }
    
    .file-icon {
      width: 6rem;
      height: 6rem;
      background: oklch(var(--muted));
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: oklch(var(--muted-foreground));
    }
  </style>
</head>
<body class="min-h-screen -mt-4">
  <div class="min-h-screen bg-background/80 backdrop-blur-sm">
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <div class="space-y-8">
        <div class="text-center space-y-4">
          <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            ${fileData.filename}
          </h1>
          <div class="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
            <span>
              ${new Date(fileData.createdAt).toLocaleDateString()}
            </span>
            <span>${formatFileSize(fileData.size)}</span>
            <span class="capitalize">${fileData.mimeType.split("/")[0]}</span>
          </div>
        </div>

        <div class="space-y-6">
          ${renderPreview()}

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="${fileUrl}" download="${fileData.filename}" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" x2="12" y1="15" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Download File
            </a>
            <button onclick="copyUrl()" id="copyBtn" class="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Copy URL
            </button>
            <a href="${fileUrl}" target="_blank" class="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" x2="21" y1="14" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Open in New Tab
            </a>
          </div>
        </div>

        <div class="text-center">
          <a href="/" class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Visit Priory
          </a>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    function copyUrl() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Copied!';
        btn.classList.add('copy-success');
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove('copy-success');
        }, 2000);
      }).catch(() => {
        console.error('Copy failed');
      });
    }
  </script>
</body>
</html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    const link = await db
      .select()
      .from(shortlink)
      .where(eq(shortlink.shortCode, code))
      .limit(1);

    if (link.length === 0) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>404 - Not Found</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script>window.location.href = '/not-found-shortlink';</script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found-shortlink">
  </noscript>
</body>
</html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    const linkData = link[0]!;

    if (!linkData.isActive) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>410 - Shortlink Disabled</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script>window.location.href = '/not-found-shortlink';</script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found-shortlink">
  </noscript>
</body>
</html>`,
        {
          status: 410,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    if (linkData.expiresAt && new Date() > linkData.expiresAt) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>410 - Shortlink Expired</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script>window.location.href = '/not-found-shortlink';</script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found-shortlink">
  </noscript>
</body>
</html>`,
        {
          status: 410,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    if (linkData.password) {
      const url = new URL(request.url);
      const passwordParam = url.searchParams.get("password");

      if (!passwordParam || passwordParam !== linkData.password) {
        return NextResponse.redirect(
          new URL(`/protected/${code}`, request.url),
        );
      }
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || null;

    await Promise.all([
      db.insert(shortlinkClick).values({
        id: nanoid(),
        shortlinkId: linkData.id,
        ipAddress,
        userAgent,
        referer,
        clickedAt: new Date(),
      }),
      db
        .update(shortlink)
        .set({
          clickCount: linkData.clickCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(shortlink.id, linkData.id)),
    ]);

    return NextResponse.redirect(linkData.originalUrl, 302);
  } catch (error) {
    console.error("Error handling redirect:", error);
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>500 - Server Error</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script>window.location.href = '/not-found-shortlink';</script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found-shortlink">
  </noscript>
</body>
</html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    );
  }
}
