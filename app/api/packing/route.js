import { createCollectionHandlers } from "@/lib/api";

export const dynamic = "force-dynamic";

const handlers = createCollectionHandlers("packing");

export const GET = handlers.GET;
export const POST = handlers.POST;
