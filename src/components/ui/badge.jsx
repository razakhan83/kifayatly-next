import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0A3D2E] text-white",
        secondary:
          "border-transparent bg-gray-100 text-gray-800",
        emerald:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        accent:
          "border-transparent bg-amber-100 text-amber-800",
        destructive:
          "border-transparent bg-red-100 text-red-700",
        outline: 
          "text-gray-700 border-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
