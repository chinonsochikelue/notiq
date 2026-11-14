"use client";

import { QueryClientProvider, QueryClient, QueryClientContext } from "@tanstack/react-query";
import { useContext, useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
  const existingClient = useContext(QueryClientContext);
  const [queryClient] = useState(() => new QueryClient());
  if (existingClient) {
    return <>{children}</>;
  }
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
