import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL(".", import.meta.url));

// Build only the independent administrator HTML and its assets; do not alter the public Cloudflare build.
export default defineConfig({
    root,
    plugins: [react()],
    base: "/",
    build: {
        outDir: resolve(root, "dist-admin"),
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(root, "admin.html"),
        },
    },
});
