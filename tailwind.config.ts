// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bavarian-blue': '#0056b3', // A deep blue inspired by the Bavarian flag
        'bavarian-white': '#ffffff', // White for the flag
      },
    },
  },
  plugins: [],
};