/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      "code": ["Source Code Pro", "monospace"]
    },
    extend: {
      backgroundImage: {
        'sare-512': "url(/assets/logo/512.png)",
        'uno-board': "url(/assets/uno-board.png)"
      }
    },
  },
  plugins: [],
}

