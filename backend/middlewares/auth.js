const jwt = require('jsonwebtoken');

const auth = ({block}) => (req, res, next) => {
        if (!req.headers.authorization && block) return res.status(400).send("Authorization header required.");

        let token;

        if (typeof req.headers.authorization === "string" && req.headers.authorization.split(" ").length === 2) {
            token = req.headers.split(" ")[1];
        } else {
            token = req.headers.authorization;
        };

        jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
            if (error && block) return res.status(401).json(error);
            
            if (block && !user) return res.status(401).send("Invalid authorization.");
            
            res.locals.user = user;
            next();
        });
        
    
    };

module.exports = auth;