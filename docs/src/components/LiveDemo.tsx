"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the Editor with SSR disabled
const Editor = dynamic(() => import("notiq").then((mod) => mod.Editor), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
});

export function LiveDemo() {
    return (
        <div className="not-prose my-8 overflow-hidden rounded-xl border bg-background shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
                <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-2 text-xs font-medium text-muted-foreground">
                    Interactive Live Demo
                </div>
            </div>
            <div className="min-h-[400px]">
                <Editor isEditable={true} />
            </div>
        </div>
    );
}
