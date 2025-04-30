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
        BackgroundColor_Darker: '#38C6E0',    // lighter version of #12B9D8
        BackgroundColor_Darkest: '#0B8CA5',   // darker version of #0EA2BE
        White: '#FAFAFA',
        TextColor: '#0C0C10',
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}