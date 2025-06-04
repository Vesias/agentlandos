import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation active:scale-95",
          {
            'default': "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/95 touch:active:bg-primary/95",
            'destructive': "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95 touch:active:bg-destructive/95",
            'outline': "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/90 touch:active:bg-accent/90",
            'secondary': "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/85 touch:active:bg-secondary/85",
            'ghost': "hover:bg-accent hover:text-accent-foreground active:bg-accent/90 touch:active:bg-accent/90",
            'link': "text-primary underline-offset-4 hover:underline active:text-primary/90 touch:active:text-primary/90",
          }[variant],
          {
            'default': "h-11 px-6 py-3 text-base xs:h-10 xs:px-4 xs:py-2 xs:text-sm sm:h-11 sm:px-6 sm:py-3 sm:text-base min-h-[44px]",
            'sm': "h-9 px-4 py-2 text-sm xs:h-8 xs:px-3 xs:text-xs sm:h-9 sm:px-4 sm:text-sm min-h-[36px]",
            'lg': "h-12 px-8 py-4 text-lg xs:h-11 xs:px-6 xs:py-3 xs:text-base sm:h-12 sm:px-8 sm:text-lg min-h-[48px]",
            'icon': "h-11 w-11 xs:h-10 xs:w-10 sm:h-11 sm:w-11 min-h-[44px] min-w-[44px]",
          }[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }