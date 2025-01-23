import { withShurikenUI } from '@shuriken-ui/tailwind'
import colors from 'tailwindcss/colors'

/**
 * This is the Tailwind config file for the demo.
 * It extends the default config from @shuriken-ui/tailwind
 *
 * You can add/override your own customizations here.
 */
export default withShurikenUI({
  content: [],
  theme: {
    // Custom fonts (defaults values are commented out)
    fontFamily: {
      sans: ['Inter  Variable', 'sans-serif'],
      heading: ['Inter  Variable', 'sans-serif'],
      alt: ['Karla  Variable', 'sans-serif'],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
    extend: {
      // Custom colors
      colors: {
        primary: {
          50: '#EDDFFC',
          100: '#DBBEF8',
          200: '#BA82F2',
          300: '#9641EC',
          400: '#7315D0',
          500: '#520F93',
          600: '#400C74',
          700: '#300958',
          800: '#21063C',
          900: '#0F031C',
          950: '#08010E',
        },
        muted: colors.neutral,
        info: colors.orange,
        success: colors.teal,
        warning: colors.yellow,
        danger: colors.rose,
      },
    },
  },
  plugins: [],
})
