/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#fbfaf8',
          subtle: '#f4f3ef',
          muted: '#edece7',
        },
        ink: {
          DEFAULT: '#1c1b18',
          secondary: '#57554f',
          muted: '#85837b',
          border: '#e4e2db',
          borderHover: '#cbc8be',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
        },
        status: {
          urgentBg: '#fef2f2',
          urgentText: '#991b1b',
          urgentBorder: '#fecaca',
          moderateBg: '#fffbeb',
          moderateText: '#92400e',
          moderateBorder: '#fde68a',
          lowBg: '#f0fdf4',
          lowText: '#166534',
          lowBorder: '#bbf7d0',
          reviewBg: '#faf5ff',
          reviewText: '#6b21a8',
          reviewBorder: '#e9d5ff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
