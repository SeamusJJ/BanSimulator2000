const { defineConfig } = require("vite");

module.exports = defineConfig({
    base: "./",

    server: {
        port: 5173
    },

    build: {
        outDir: "dist",
        emptyOutDir: true
    }
});