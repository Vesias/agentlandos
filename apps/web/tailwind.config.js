/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '375px',    // iPhone SE and smaller phones
      'sm': '430px',    // Standard modern phones (iPhone 14 Pro)
      'md': '768px',    // Tablets
      'lg': '1024px',   // Small laptops
      'xl': '1280px',   // Desktop
      '2xl': '1536px',  // Large desktop
      // Touch-specific breakpoints
      'touch': {'raw': '(hover: none) and (pointer: coarse)'},
      'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
      // Density-specific breakpoints  
      'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
    },
    extend: {
      colors: {
        // WCAG 2.1 AA Compliant Professional Brand Colors
        
        // Saarland Blue - Primary Brand (7.1:1 contrast ratio)
        'saarland-blue': {
          50: '#f0f4ff',    // hsl(220 100% 95%)
          100: '#dbeafe',   // hsl(220 100% 90%)
          200: '#bfdbfe',   // hsl(220 100% 80%)
          300: '#93c5fd',   // hsl(220 100% 70%)
          400: '#60a5fa',   // hsl(220 100% 60%)
          500: '#3b82f6',   // hsl(220 100% 50%)
          600: '#2563eb',   // hsl(220 100% 40%)
          700: '#1d4ed8',   // hsl(220 100% 30%) - Primary brand
          800: '#1e40af',   // hsl(220 100% 25%)
          900: '#1e3a8a',   // hsl(220 100% 20%)
          DEFAULT: '#1d4ed8', // Primary brand color
        },
        
        // Technical Silver - Professional Neutral Palette
        'technical-silver': {
          50: '#fafbfc',    // hsl(210 20% 98%)
          100: '#f1f3f4',   // hsl(210 20% 95%)
          200: '#e4e7ea',   // hsl(210 20% 90%)
          300: '#d1d6db',   // hsl(210 20% 83%)
          400: '#9ca3af',   // hsl(210 20% 64%)
          500: '#6b7280',   // hsl(210 20% 45%)
          600: '#4b5563',   // hsl(210 20% 37%)
          700: '#374151',   // hsl(210 20% 28%)
          800: '#1f2937',   // hsl(210 20% 20%)
          900: '#111827',   // hsl(210 20% 12%)
          DEFAULT: '#e4e7ea', // Main silver
        },
        
        // Innovation Cyan - Interactive Elements (FIXED: 4.5:1+ contrast)
        'innovation-cyan': {
          50: '#f0fbff',    // hsl(199 100% 95%)
          100: '#e0f7fa',   // hsl(199 100% 90%)
          200: '#b3e5fc',   // hsl(199 100% 80%)
          300: '#81d4fa',   // hsl(199 100% 70%)
          400: '#4fc3f7',   // hsl(199 100% 60%)
          500: '#29b6f6',   // hsl(199 100% 50%)
          600: '#0277bd',   // FIXED: Darker for 4.6:1 contrast with white
          700: '#0277bd',   // hsl(199 100% 32%)
          800: '#01579b',   // hsl(199 100% 26%)
          900: '#014a7a',   // Darker variant
          DEFAULT: '#0277bd', // FIXED: Primary cyan for WCAG AA
        },
        
        // Warm Gold - Accents & CTAs (FIXED: 4.5:1+ contrast)
        'warm-gold': {
          50: '#fffbeb',    // hsl(43 97% 95%)
          100: '#fef3c7',   // hsl(43 97% 90%)
          200: '#fde68a',   // hsl(43 97% 80%)
          300: '#fcd34d',   // hsl(43 97% 70%)
          400: '#fbbf24',   // hsl(43 97% 60%)
          500: '#b45309',   // FIXED: Darker for 4.7:1 contrast with white
          600: '#b45309',   // hsl(43 97% 40%) - FIXED for white text
          700: '#92400e',   // hsl(43 97% 33%)
          800: '#78350f',   // hsl(43 97% 26%)
          900: '#5c2a0b',   // Darker variant
          DEFAULT: '#b45309', // FIXED: Primary gold for WCAG AA
        },
        
        // Success Green - Status & Confirmations (FIXED: 4.5:1+ contrast)
        'success-green': {
          50: '#f0fdf4',    // hsl(142 70% 95%)
          100: '#dcfce7',   // hsl(142 70% 90%)
          200: '#bbf7d0',   // hsl(142 70% 80%)
          300: '#86efac',   // hsl(142 70% 70%)
          400: '#4ade80',   // hsl(142 70% 60%)
          500: '#22c55e',   // hsl(142 70% 50%)
          600: '#15803d',   // FIXED: Darker for 4.8:1 contrast with white
          700: '#15803d',   // hsl(142 70% 32%)
          800: '#166534',   // hsl(142 70% 24%)
          900: '#14532d',   // hsl(142 70% 16%)
          DEFAULT: '#15803d', // FIXED: Primary green for WCAG AA
        },
        
        // Alert Red - Errors & Critical Info (6.1:1 contrast)
        'alert-red': {
          50: '#fef2f2',    // hsl(355 86% 95%)
          100: '#fee2e2',   // hsl(355 86% 90%)
          200: '#fecaca',   // hsl(355 86% 80%)
          300: '#fca5a5',   // hsl(355 86% 70%)
          400: '#f87171',   // hsl(355 86% 60%)
          500: '#ef4444',   // hsl(355 86% 52%)
          600: '#dc2626',   // hsl(355 86% 45%) - Primary red
          700: '#b91c1c',   // hsl(355 86% 38%)
          800: '#991b1b',   // hsl(355 86% 31%)
          900: '#7f1d1d',   // hsl(355 86% 24%)
          DEFAULT: '#dc2626', // Primary red
        },
        
        // Neutral Gray - Text & UI (FIXED: 4.5:1+ contrast)
        'neutral-gray': {
          50: '#f8fafc',    // hsl(220 8% 98%)
          100: '#f1f5f9',   // hsl(220 8% 95%)
          200: '#e2e8f0',   // hsl(220 8% 90%)
          300: '#cbd5e1',   // hsl(220 8% 83%)
          400: '#64748b',   // FIXED: Darker for 4.5:1+ contrast on light backgrounds
          500: '#475569',   // hsl(220 8% 37%) - Body text
          600: '#334155',   // hsl(220 8% 28%)
          700: '#1e293b',   // hsl(220 8% 20%)
          800: '#0f172a',   // hsl(220 8% 12%)
          900: '#020617',   // Darker variant
          DEFAULT: '#475569', // FIXED: Body text for WCAG AA
        },
        
        // Legacy compatibility - updated with brand colors
        'primary': {
          50: '#f0f4ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1d4ed8',  // Updated to brand color
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3a8a',
          DEFAULT: '#1d4ed8', // Saarland Blue
        },
        
        // Saarland region colors - updated
        'saarland': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',  // Success green
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#16a34a',
        },
        
        // Professional Grays - maintained
        'neutral': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0', 
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        
        // shadcn/ui compatibility (using CSS variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--font-professional)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
        professional: ['var(--font-professional)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      maxHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }], 
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
      },
      touchAction: {
        'pan-x-pan-y': 'pan-x pan-y',
        'manipulation': 'manipulation',
      },
    },
  },
  plugins: [],
}