import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'reorder-css-script',
          transformIndexHtml: {
            order: 'post',
            handler(html) {
              // Move CSS link tag before script tag for proper loading order
              // Find the script tag and CSS link tag
              const scriptRegex = /<script[^>]*type="module"[^>]*><\/script>/;
              const linkRegex = /<link[^>]*rel="stylesheet"[^>]*>/;
              
              const scriptMatch = html.match(scriptRegex);
              const linkMatch = html.match(linkRegex);
              
              if (scriptMatch && linkMatch) {
                // Remove both tags
                let result = html.replace(scriptMatch[0], '').replace(linkMatch[0], '');
                
                // Find the closing </head> tag and insert CSS link before it, then script after
                result = result.replace('</head>', linkMatch[0] + '\n  ' + scriptMatch[0] + '\n</head>');
                return result;
              }
              return html;
            }
          }
        }
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
      }
    };
});
