import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import type { OverlayScrollbarsComponentProps } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { cn } from "@/lib/utils";

const sharedOptions: OverlayScrollbarsComponentProps["options"] = {
  scrollbars: {
    theme: "os-theme-mythwriter",
    autoHide: "leave",
    autoHideDelay: 800,
    visibility: "auto",
    dragScroll: true,
    clickScroll: true,
  },
};

interface ScrollbarProps extends OverlayScrollbarsComponentProps {
  className?: string;
}

export function Scrollbar({ className, children, options, ...props }: ScrollbarProps) {
  return (
    <OverlayScrollbarsComponent
      options={{ ...sharedOptions, ...options }}
      className={cn("os-host-flex", className)}
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
