import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates the PNG app icons from public/icon.svg. Run `npm run icons` after changing the SVG.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#16232F' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#16232F' } },
  },
  images: ['public/icon.svg'],
})
