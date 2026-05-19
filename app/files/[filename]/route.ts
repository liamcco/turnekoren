import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
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

  redirect(file.url);
}
