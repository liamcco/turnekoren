import { createCollectionHandlers } from "@/lib/api";

export const dynamic = "force-dynamic";

const handlers = createCollectionHandlers("contacts");

export const GET = handlers.GET;
export const POST = handlers.POST;
