import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const file = await prisma.fileAsset.findUnique({
    where: { filename },
  });

  if (!file) {
    notFound();
  }

  const blobResponse = await fetch(file.url);

  if (!blobResponse.ok || !blobResponse.body) {
    notFound();
  }

  return new Response(blobResponse.body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Content-Length": String(file.size),
      "Content-Type": file.contentType,
    },
    status: blobResponse.status,
  });
}
