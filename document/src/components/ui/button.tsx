import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-surface-900 text-white hover:bg-surface-800 active:bg-surface-950 shadow-sm dark:bg-surface-100 dark:text-surface-900 dark:hover:bg-surface-200 dark:active:bg-surface-300",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        outline:
          "border border-surface-300 bg-transparent hover:bg-surface-100 active:bg-surface-200 dark:border-surface-700 dark:hover:bg-surface-800 dark:active:bg-surface-700",
        secondary:
          "bg-surface-100 text-surface-900 hover:bg-surface-200 active:bg-surface-300 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700 dark:active:bg-surface-600",
        ghost: "hover:bg-surface-100 active:bg-surface-200 text-surface-700 dark:hover:bg-surface-800 dark:active:bg-surface-700",
        link: "text-surface-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-8 w-8",
        "icon-sm": "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
