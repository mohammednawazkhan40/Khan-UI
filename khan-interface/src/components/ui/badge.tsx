import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:    'bg-primary/10 text-primary',
        secondary:  'bg-secondary text-secondary-foreground',
        outline:    'border border-current text-current',
        critical:   'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        high:       'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
        medium:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
        low:        'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
        overdue:    'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        active:     'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
        pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
        completed:  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
        info:       'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
        khan:       'khan-gradient text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
