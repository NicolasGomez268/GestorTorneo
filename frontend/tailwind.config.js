/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:        '#0A0A0A',
          surface:   '#131313',
          card:      '#1A1A1A',
          border:    '#2A2A2A',
          orange:    '#FF6B00',
          'orange-dim': '#CC5500',
          text:      '#FFFFFF',
          muted:     '#888888',
          error:     '#FF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        black: '900',
      },
    },
  },
  plugins: [],
}
