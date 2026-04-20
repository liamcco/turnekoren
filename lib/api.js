import { listRows, replaceRows } from "./repository";

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export function createCollectionHandlers(collectionKey) {
  return {
    GET() {
      return jsonResponse({ items: listRows(collectionKey) });
    },
    async POST(request) {
      try {
        const payload = await request.json();
        const items = replaceRows(collectionKey, payload.items);
        return jsonResponse({ items });
      } catch (error) {
        return jsonResponse(
          {
            error: error instanceof Error ? error.message : "Unable to save changes.",
          },
          400,
        );
      }
    },
  };
}
