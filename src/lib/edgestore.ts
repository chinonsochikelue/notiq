'use client';

// import { EdgeStoreRouter } from "../app/api/edgestore/[...edgestore]/route";
import { createEdgeStoreProvider } from '@edgestore/react';

const { EdgeStoreProvider, useEdgeStore }: { EdgeStoreProvider: any; useEdgeStore: any } =
  createEdgeStoreProvider<any>();

export { EdgeStoreProvider, useEdgeStore };