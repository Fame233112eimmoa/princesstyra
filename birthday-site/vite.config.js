import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const page = (name) => resolve(import.meta.dirname, name);

// Relative base so the build works on Netlify and on GitHub Pages sub-paths.
export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        home: page('index.html'),
        story: page('story.html'),
        letter: page('letter.html'),
        love: page('love.html'),
        wishes: page('wishes.html'),
        fromMe: page('from-me.html'),
        surprise: page('surprise.html'),
      },
    },
  },
});
