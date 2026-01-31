/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',               // ← Esto genera archivos estáticos en /out
  basePath: '/Reservas-salas-Ucaldas',  // ← Nombre exacto de tu repo (case-sensitive!)
  assetPrefix: '/Reservas-salas-Ucaldas/', // ← Para que cargue CSS/JS/imágenes correctamente
  images: {
    unoptimized: true,            // ← Obligatorio en GitHub Pages (no soporta optimización de Next.js)
  },
  trailingSlash: true,             // ← Ayuda con rutas en algunos casos
};

export default nextConfig;
