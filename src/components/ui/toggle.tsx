"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-zinc-100 data-[state=on]:text-zinc-900 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:hover:bg-zinc-800 dark:hover:text-zinc-400 dark:focus-visible:ring-zinc-300 dark:data-[state=on]:bg-zinc-800 dark:data-[state=on]:text-zinc-50",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border-none cursor-pointer bg-transparent shadow-sm",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-7 rounded-md px-[6px] ",
        lg: "h-10 px-2.5 min-w-10",
        Toolbar: "h-7 w-7 p-3",
        floting: " h-5 w-5 p-3"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants> & { tip?: string }
>(({ className, variant, tip, size, ...props }, ref) =>
  tip ? (
    <TooltipProvider>
      <Tooltip delayDuration={0.2}>
        <TooltipTrigger asChild>
          <div>
            <TogglePrimitive.Root
              ref={ref}
              className={cn(toggleVariants({ variant, size, className }))}
              {...props}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side={"top"}>
          <span>{tip}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
);

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
