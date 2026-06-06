/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEEDFE',
          100: '#CECBF6',
          200: '#AFA9EC',
          400: '#7F77DD',
          500: '#534AB7',
          600: '#3C3489',
          700: '#26215C',
        },
        success: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          400: '#1D9E75',
          500: '#0F6E56',
          600: '#085041',
        },
        info: {
          50:  '#E6F1FB',
          100: '#B5D4F4',
          400: '#378ADD',
          500: '#185FA5',
          600: '#0C447C',
        },
        warn: {
          50:  '#FAEEDA',
          100: '#FAC775',
          400: '#EF9F27',
          500: '#854F0B',
          600: '#633806',
        },
        danger: {
          50:  '#FCEBEB',
          100: '#F7C1C1',
          400: '#E24B4A',
          500: '#A32D2D',
        },
        light: {
          bg:     '#F8F7FF',
          card:   '#FFFFFF',
          border: '#EDE9FF',
          text:   '#3C3489',
          muted:  '#888780',
        },
        dark: {
          bg:     '#0F0F1A',
          card:   '#1A1A2E',
          border: '#2A2A3E',
          text:   '#E2E8F0',
          muted:  '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl:    '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft:   '0 2px 15px rgba(0,0,0,0.06)',
        medium: '0 4px 25px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}