const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://grabdocs.com',
    supportFile: 'cypress/support/e2e.js',
    env: {
      EMAIL: 'ashleichang@gmail.com',
      PASSWORD: 'Brownie11$'
    }
  },
});
