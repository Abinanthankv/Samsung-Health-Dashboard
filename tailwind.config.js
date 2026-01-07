/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                lime: {
                    400: '#bef264',
                    500: '#bef264',
                }
            }
        },
    },
    plugins: [],
}
