/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        BackgroundColor: '#F0F5F9',
        BackgroundColor_Darker: '#12B9D8',
        White: '#FAFAFA',
        TextColor: '#0C0C10'
      }
    },
  },
  plugins: [],
}