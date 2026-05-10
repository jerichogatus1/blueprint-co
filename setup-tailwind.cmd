@echo off
cd %~dp0
npm install --save-dev tailwindcss@latest postcss@latest autoprefixer@latest
echo export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] } > tailwind.config.js
echo export default { plugins: { tailwindcss: {}, autoprefixer: {} } } > postcss.config.js
echo @tailwind base; @tailwind components; @tailwind utilities; > src/index.css
echo Tailwind setup complete!
pause