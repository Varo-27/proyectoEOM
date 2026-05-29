import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"

export interface LoadingButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function LoadingButton({
  className,
  loading = false,
  children,
  disabled,
  variant,
  size,
  asChild = false,
  ...props
}: LoadingButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      )}
      <Slottable>{children}</Slottable>
    </Comp>
  )
}

export { LoadingButton }
