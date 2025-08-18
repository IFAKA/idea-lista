import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync, readFileSync, writeFileSync, rmSync } from 'fs'

// Plugin to copy extension files to dist
function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    writeBundle() {
      const filesToCopy = [
        'manifest.json',
        'background.js',
        'content.js',
        'icon16.png',
        'icon48.png',
        'icon128.png'
      ]
      
      filesToCopy.forEach(file => {
        if (existsSync(file)) {
          copyFileSync(file, `dist/${file}`)
          console.log(`✅ Copied ${file} to dist/`)
        } else {
          console.log(`⚠️ ${file} not found, skipping...`)
        }
      })
      
      // Move popup.html to dist root and fix paths
      if (existsSync('dist/src/popup.html')) {
        const popupContent = readFileSync('dist/src/popup.html', 'utf8')
        const fixedContent = popupContent
          .replace(/src="\.\.\//g, 'src="./')
          .replace(/href="\.\.\//g, 'href="./')
        writeFileSync('dist/popup.html', fixedContent)
        rmSync('dist/src', { recursive: true, force: true })
        console.log('✅ Fixed popup.html paths and moved to dist/')
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  base: './',
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    target: 'es2020',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2
      },
      mangle: {
        toplevel: true
      }
    },
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html')
      },
      output: {
        entryFileNames: 'popup.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        dir: 'dist',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-tabs'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand']
  }
})
