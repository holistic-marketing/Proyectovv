import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      "next-env.d.ts",
      "scripts/**",
    ],
  },
  {
    // Se mantiene idéntico a main (cero cambios en rutas de API en la rama de lint).
    // Quitar este override cuando se aplique el `let` → `const` en un PR de backend.
    files: ["app/api/creative-assets/route.ts"],
    rules: { "prefer-const": "off" },
  },
];

export default config;
