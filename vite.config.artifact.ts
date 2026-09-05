import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Produces a single self-contained dist/index.html (JS + CSS inlined) so the app
// can be shared as one static file — e.g. published as a Claude Artifact.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    cssCodeSplit: false,
  },
});
