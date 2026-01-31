/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',                     // ← Esto es lo que genera ./out/
  images: {
    unoptimized: true,                  // GitHub Pages no soporta optimización Next.js
  },
  basePath: '/Eventos-Ucaldas',         // Nombre exacto del repo (case-sensitive!)
  assetPrefix: '/Eventos-Ucaldas/',     // Con barra final para assets
};

export default nextConfig;
