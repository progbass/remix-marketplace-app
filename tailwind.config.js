const plugin = require('tailwindcss/plugin')

const breakpoints = require('./tailwind/breakpoints')
const colors = require('./tailwind/colors')
const spacings = require('./tailwind/spacings')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/**/*.{js,ts,jsx,tsx,mdx}',
    // './stories/**/*.{js,ts,jsx,tsx,mdx}',
    // 'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      ...colors
    },
    // extend: {
    //   fontSize: {
    //     '3xl': '1.75rem',
    //   },
    //   outlineWidth: {
    //     3: '3px',
    //   },
    //   borderWidth: {
    //     1: '1px',
    //   },
    //   height: {
    //     unset: 'unset',
    //     35: '8.75rem',
    //   },
    //   padding: {
    //     '10%': '10%',
    //     13: '3.25rem',
    //   },
    //   width: {
    //     'max-content': '72rem',
    //     15: '3.75rem',
    //     37.5: '9.375rem',
    //     '7xl': '94.5rem',
    //     50: '12.5rem',
    //     // 'max-w-content-lg': '51.5rem',
    //   },
    //   maxWidth: {
    //     'content-lg': '51.5rem',
    //     'content-xl': '34.375rem',
    //     'action-wrapper': '37.5rem',
    //     15: '3.75rem',
    //     136: '34rem',
    //     80: '20rem',
    //   },
    //   transitionProperty: {
    //     width: 'width',
    //   },
    //   screens: {
    //     sm: `${breakpoints.sm}px`,
    //     md: `${breakpoints.md}px`,
    //     lg: `${breakpoints.lg}px`,
    //     'max-content': `${breakpoints['max-content']}px`,
    //   },
    //   spacing: {
    //     0.5: '0.125rem',
    //     15: '3.75rem',
    //     sm: `${spacings.sm}px`,
    //     md: `${spacings.md}px`,
    //     lg: `${spacings.lg}px`,
    //     26: '6.5rem',
    //     28: '7rem',
    //     87: '21.75rem',
    //     '15%': '15%',
    //   },
    //   minHeight: {
    //     13: '3.25rem',
    //     28: '7rem',
    //   },
    //   maxHeight: {
    //     28: '7rem',
    //   },
    //   gridColumnStart: {
    //     last: '-1',
    //   },
    // },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    
    // require('flowbite/plugin'),
    // plugin(({ addVariant }) => {
    //   addVariant('children', '& > *')
    // }),
  ],
}
