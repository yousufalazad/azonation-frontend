import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import * as lucide from "lucide-vue-next";

// Lucide icons are used in templates without being imported (e.g. <Pencil />).
// This resolver imports only the icons a component actually uses, instead of
// registering all ~1,500 icons globally.
function LucideResolver(name) {
  if (name in lucide && name !== "default" && name !== "icons") {
    return { name, from: "lucide-vue-next" };
  }
}

// Content-Security-Policy for production builds. It limits where scripts,
// styles, images and API calls may come from, which blocks most XSS payloads.
function contentSecurityPolicy(apiBase) {
  let apiOrigin = "";
  try {
    apiOrigin = new URL(apiBase).origin;
  } catch {
    // relative or empty API base: same origin only
  }
  const api = apiOrigin ? ` ${apiOrigin}` : "";
  const directives = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self'${api}`,
    "worker-src 'self' blob:",
    "frame-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self'${api}`,
  ];
  if (apiOrigin.startsWith("https:")) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [
      vue(),
      Components({
        // Shared Az* components (src/components/ui) can be used in any template without importing
        dirs: ["src/components/ui"],
        dts: false,
        resolvers: [LucideResolver],
      }),
      {
        name: "azonation-csp",
        transformIndexHtml(html) {
          if (command !== "build") return html.replace("<!-- %CSP% -->", "");
          const csp = contentSecurityPolicy(env.VITE_API_BASE);
          return html.replace(
            "<!-- %CSP% -->",
            `<meta http-equiv="Content-Security-Policy" content="${csp}" />`,
          );
        },
      },
    ],
    define: {
      // vue-i18n build flags: Composition API only, no devtools in production
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    esbuild: {
      // Remove debug logging from production bundles; console.error/warn stay.
      pure: command === "build" ? ["console.log", "console.debug", "console.info"] : [],
      drop: command === "build" ? ["debugger"] : [],
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          // Long-lived vendor chunks: they change rarely, so browsers keep them cached.
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (/[\\/]node_modules[\\/](vue|@vue|vue-router)[\\/]/.test(id)) return "vendor-vue";
            if (/[\\/]node_modules[\\/](axios|sweetalert2|dompurify)[\\/]/.test(id)) return "vendor-core";
            if (/[\\/]node_modules[\\/](vue-i18n|@intlify)[\\/]/.test(id)) return "vendor-vue";
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8000", // Laravel backend URL, only used in development
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
