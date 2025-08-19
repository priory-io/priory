import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { config } from "~/lib/config";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (config.storage.type !== "local") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { path: filePath } = await params;
    const fullPath = path.join(config.localStorage.basePath, ...filePath);

    if (!fullPath.startsWith(config.localStorage.basePath)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fileBuffer = await fs.readFile(fullPath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
