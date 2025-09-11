import { defineConfig } from "cypress";
import mochawesome from "cypress-mochawesome-reporter/plugin";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,                   
    screenshotOnRunFailure: true,
    env: {
      apiUrl: "http://localhost:8000/api/v1",
    },
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
      charts: true,
      reportPageTitle: "Reporte Cypress",
      embeddedScreenshots: false,  // no incrusta imágenes en el HTML
      inlineAssets: true,         // no copia assets dentro del HTML
    },
    setupNodeEvents(on, config) {
      mochawesome(on);
    },
  },
});



