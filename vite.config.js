// frontend/vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        about: resolve(__dirname, 'public/about.html'),
        contact: resolve(__dirname, 'public/contact.html'),
        products: resolve(__dirname, 'public/products.html'),
        productDetail: resolve(__dirname, 'public/product-detail.html'),
        order: resolve(__dirname, 'public/order.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
