import { initEdgeStore } from '@edgestore/server';

// Initialize the EdgeStore
const es = initEdgeStore.create();

/**
 * This is the main router for the Edge Store buckets.
 * We're configuring a file bucket that allows all file types and limits size to 1GB.
 */
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket({
    // Set file size limit to 1 GB (1 GB = 1,073,741,824 bytes)
    maxSize: 1_073_741_824,
  }),
});

let cachedHandler: any = null;

const handler = async (req: Request, ctx: any) => {
  if (!process.env.EDGE_STORE_ACCESS_KEY || !process.env.EDGE_STORE_SECRET_KEY) {
    return new Response(
      JSON.stringify({
        token: 'mock-dev-token',
        baseUrl: '/api/edgestore',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!cachedHandler) {
    const { createEdgeStoreNextHandler } = await import('@edgestore/server/adapters/next/app');
    cachedHandler = createEdgeStoreNextHandler({
      router: edgeStoreRouter,
    });
  }

  try {
    const res = await cachedHandler(req, ctx);
    if (res && res.status >= 400) {
      console.warn("[Notiq EdgeStore] EdgeStore returned error status:", res.status, "- fallback to mock token");
      return new Response(
        JSON.stringify({
          token: 'mock-dev-token',
          baseUrl: '/api/edgestore',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return res;
  } catch (err: any) {
    console.warn("[Notiq EdgeStore] Fallback to mock response:", err?.message || err);
    return new Response(
      JSON.stringify({
        token: 'mock-dev-token',
        baseUrl: '/api/edgestore',
        error: "EdgeStore offline or unauthorized",
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
