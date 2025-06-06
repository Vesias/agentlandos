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
        aria-label={props['aria-label'] || (typeof props.children === 'string' ? props.children : 'Button')}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation active:scale-95",
          {
            'default': "bg-saarland-blue-700 text-white shadow-md hover:bg-saarland-blue-800 active:bg-saarland-blue-900 focus:ring-3 focus:ring-saarland-blue-300 focus:ring-offset-2 hover:shadow-lg disabled:bg-neutral-gray-300 disabled:text-neutral-gray-500",
            'destructive': "bg-alert-red-600 text-white shadow-md hover:bg-alert-red-700 active:bg-alert-red-800 focus:ring-3 focus:ring-alert-red-300 focus:ring-offset-2 hover:shadow-lg disabled:bg-neutral-gray-300 disabled:text-neutral-gray-500",
            'outline': "border-2 border-saarland-blue-700 bg-white text-saarland-blue-700 shadow-sm hover:bg-saarland-blue-700 hover:text-white active:bg-saarland-blue-800 active:border-saarland-blue-800 focus:ring-3 focus:ring-saarland-blue-300 focus:ring-offset-2 hover:shadow-md disabled:border-neutral-gray-300 disabled:text-neutral-gray-400",
            'secondary': "bg-innovation-cyan-600 text-white shadow-md hover:bg-innovation-cyan-700 active:bg-innovation-cyan-800 focus:ring-3 focus:ring-innovation-cyan-300 focus:ring-offset-2 hover:shadow-lg disabled:bg-neutral-gray-300 disabled:text-neutral-gray-500",
            'ghost': "text-saarland-blue-700 bg-transparent hover:bg-saarland-blue-100 hover:text-saarland-blue-800 active:bg-saarland-blue-200 focus:ring-3 focus:ring-saarland-blue-300 focus:ring-offset-2 disabled:text-neutral-gray-400 disabled:hover:bg-transparent",
            'link': "text-saarland-blue-700 underline-offset-4 hover:underline hover:text-saarland-blue-800 active:text-saarland-blue-900 focus:ring-3 focus:ring-saarland-blue-300 focus:ring-offset-2 focus:outline-none disabled:text-neutral-gray-400 disabled:no-underline",
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