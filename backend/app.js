const express = require("express");
require('express-async-errors');
const cors = require("cors");
const path = require('path');
//const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/docs.json');

const app = express();

const corsOptions = {
    origin: process.env.APP_URL,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use([
    morgan(':method :url :status :res[content-length] - :response-time ms'),
]);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const diveSiteRoutes = require('./routes/diveSite');
app.use('/api/divesite', diveSiteRoutes);

const diveLogRoutes = require('./routes/diveLog');
app.use('/api/divelog', diveLogRoutes);

const planRoutes = require('./routes/plan');
app.use('/api/plan', planRoutes);

const userSettingsRoutes = require('./routes/userSettings');
app.use('/api/settings', userSettingsRoutes);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(errorHandler);

module.exports = app;
