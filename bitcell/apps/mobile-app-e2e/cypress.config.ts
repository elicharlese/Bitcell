import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run mobile-app:serve',
        production: 'nx run mobile-app:serve:production',
      },
      ciWebServerCommand: 'nx run mobile-app:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
