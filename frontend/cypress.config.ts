import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1440,   // ancho
    viewportHeight: 900,   // alto
    env: {
      apiUrl: "http://localhost:8000/api/v1",
    },
    setupNodeEvents(on, config) {
      // puedes registrar listeners si los necesitas
    },
  },
});

