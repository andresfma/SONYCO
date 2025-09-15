import { defineConfig } from "cypress";
import mochawesome from "cypress-mochawesome-reporter/plugin";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1440,
    viewportHeight: 900,
    video: true,
    screenshotOnRunFailure: true,
    env: {
      apiUrl: "http://localhost:8000/api/v1",
    },
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
      charts: true,
      reportPageTitle: "Reporte Cypress",
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    setupNodeEvents(on, config) {
      // Conexión con mochawesome como plugin
      mochawesome(on, config);

      // Retorna config para que Cypress use los cambios
      return config;
    },
  },
});




