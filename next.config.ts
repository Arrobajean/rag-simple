import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Next tome como raíz un package-lock.json de una carpeta superior
  turbopack: { root: __dirname },
  // Memoiza componentes y valores automáticamente en build
  reactCompiler: true,
};

export default nextConfig;
