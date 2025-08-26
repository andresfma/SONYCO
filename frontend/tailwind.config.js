/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        orange: "#FA8232",
        orange_hover: "#D76A29",
        blue: "#455A64",
        blue_hover: "#212C30",
        black: "#1A1A1A",
        white: "#FFFFFF",

        cl_font_main: "#030712", //gray-950
        cl_font_sec: "#4b5563",  //gray-600
        cl_font_top_table: "#6b7280", //gray-500
        cl_font_into_table: "#111827", //gray-900

        gray_bg: "#f4f5fb",
        gray_top_table: "#f9fafb", //gray-50
        gray_lines: "#e5e7eb", //gray-200
        gray_lines_int: "#f3f4f6", //gray-100
        gray_hover: "#f9fafb", //gray-50

        gray_select: "#767676",


        // Colores acciones comunes
        icon_blue_hover: "#EFF6FF", //blue-50
        icon_green_hover: "#f0fdf4", //green-50
        icon_amber_hover: "#fffbeb", // ambar-50
        icon_red_hover: "#fef2f2", //red-50

      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ],
      },
      borderRadius: {
        app: '0.75rem', // 12px 
      },
    },
  },
  plugins: [],
}