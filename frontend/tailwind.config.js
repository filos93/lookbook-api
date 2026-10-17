/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        body: 'var(--text)',
        heading: 'var(--text-h)',
        bgMain: 'var(--bg)',
        borderCustom: 'var(--border)',
        codeBg: 'var(--code-bg)',
        accent: {
          DEFAULT: 'var(--accent)',
          bg: 'var(--accent-bg)',
          border: 'var(--accent-border)',
        },
      },
      boxShadow: {
        custom: 'var(--shadow)',
      }
    },
  },
  plugins: [],
}