/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line ensures all your React components are scanned
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

