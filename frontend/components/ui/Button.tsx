import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25 active:scale-95 focus:ring-primary-400/50',
      secondary: 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/25 active:scale-95 focus:ring-secondary-400/50',
      accent: 'bg-gradient-to-r from-accent-500 to-secondary-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-accent-500/25 active:scale-95 focus:ring-accent-400/50',
      outline: 'border-2 border-primary-300 bg-white/80 text-primary-600 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-400/50'
    }
    
    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-lg',
      md: 'h-10 px-4 rounded-xl',
      lg: 'h-12 px-6 text-lg rounded-xl'
    }

    return (
      <button
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }