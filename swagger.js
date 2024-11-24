const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Документація',
      version: '1.0.0',
      description: 'Лаб 6 документація на ендпоінт /docs',
    },
  },
  apis: [path.join(__dirname, 'main.js')], 
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
