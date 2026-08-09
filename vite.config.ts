import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repo from /NAN_buddy-bingo/, so the built index.html
// has to reference its bundle from there. Runtime image paths ('assets/x.png')
// are relative and resolve against that same base, so they need no change.
// Overridable for other hosts: BASE_PATH=/ npm run build
const base = process.env.BASE_PATH ?? '/NAN_buddy-bingo/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
