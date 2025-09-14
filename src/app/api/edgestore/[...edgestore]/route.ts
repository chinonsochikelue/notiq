import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

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

// Create the handler for the GET and POST routes
const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;