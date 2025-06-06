'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

// Form Field Component
export interface FormFieldProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, description, error, required, children, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <label className="block text-sm font-semibold text-neutral-gray-800 dark:text-technical-silver-100 mb-1">
            {label}
            {required && <span className="text-alert-red-600 ml-1 font-bold" aria-label="required">*</span>}
          </label>
        )}
        {description && (
          <p className="text-sm text-neutral-gray-600 dark:text-technical-silver-300 mb-1">
            {description}
          </p>
        )}
        {children}
        {error && (
          <p className="text-sm text-alert-red-700 dark:text-alert-red-400 flex items-center gap-1 mt-1 font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

// Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border-2 border-technical-silver-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-gray-500 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-saarland-blue-300 focus-visible:border-saarland-blue-600 disabled:cursor-not-allowed disabled:bg-technical-silver-100 disabled:text-neutral-gray-400 disabled:border-technical-silver-200 transition-all duration-200",
          "min-h-[44px] touch-manipulation", // Mobile optimization
          error && "border-alert-red-500 focus-visible:ring-alert-red-300 focus-visible:border-alert-red-600 bg-alert-red-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Select Component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-11 w-full rounded-md border-2 border-technical-silver-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-saarland-blue-300 focus-visible:border-saarland-blue-600 disabled:cursor-not-allowed disabled:bg-technical-silver-100 disabled:text-neutral-gray-400 disabled:border-technical-silver-200 transition-all duration-200",
          "min-h-[44px] touch-manipulation appearance-none cursor-pointer",
          error && "border-alert-red-500 focus-visible:ring-alert-red-300 focus-visible:border-alert-red-600 bg-alert-red-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border-2 border-technical-silver-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 font-medium ring-offset-background placeholder:text-neutral-gray-500 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-saarland-blue-300 focus-visible:border-saarland-blue-600 disabled:cursor-not-allowed disabled:bg-technical-silver-100 disabled:text-neutral-gray-400 disabled:border-technical-silver-200 resize-vertical transition-all duration-200",
          "touch-manipulation",
          error && "border-alert-red-500 focus-visible:ring-alert-red-300 focus-visible:border-alert-red-600 bg-alert-red-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// Checkbox Component
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || React.useId()
    
    return (
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            "mt-1 h-4 w-4 min-h-[16px] min-w-[16px] rounded border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors cursor-pointer",
            "touch-manipulation",
            className
          )}
          ref={ref}
          {...props}
        />
        {(label || description) && (
          <div className="space-y-1 leading-none">
            {label && (
              <label 
                htmlFor={checkboxId}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'default', className }: { size?: 'sm' | 'default' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  return (
    <svg
      className={cn(
        "animate-spin text-current",
        sizeClasses[size],
        className
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Progress Steps Component
export interface ProgressStep {
  id: string
  title: string
  description?: string
  completed: boolean
  current: boolean
}

export interface ProgressStepsProps {
  steps: ProgressStep[]
  className?: string
}

export const ProgressSteps = ({ steps, className }: ProgressStepsProps) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center space-x-2 sm:space-x-4">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="flex items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div
                className={cn(
                  "flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
                  step.completed
                    ? "bg-green-600 text-white"
                    : step.current
                    ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                )}
                aria-current={step.current ? "step" : undefined}
              >
                {step.completed ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{stepIdx + 1}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {stepIdx < steps.length - 1 && (
              <div className="ml-2 h-0.5 w-4 sm:w-8 bg-gray-200 dark:bg-gray-700" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Success/Error Alert Component
export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  className?: string
}

export const Alert = ({ type, title, message, className }: AlertProps) => {
  const styles = {
    success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
  }
  
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  }
  
  return (
    <div className={cn(
      "rounded-md border p-4",
      styles[type],
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {message}
          </div>
        </div>
      </div>
    </div>
  )
}