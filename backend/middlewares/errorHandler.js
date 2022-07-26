const logger = require('../utils/logger');

const errorHandler  = (err, req, res, next) => { 
    //console.log(err)
    logger.error(new Error("render error"), err.toString());
    res.status(500).json(err);
};

module.exports = errorHandler;