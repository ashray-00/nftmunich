// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#1e3a8a', // Example custom blue color
        'custom-red': '#dc2626', // Example custom red color
        'custom-black': '#000000', // Example custom black color
      },
    },
  },
  plugins: [],
};