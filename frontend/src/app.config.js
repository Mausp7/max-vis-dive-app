const _config = {
    dev: {
        appUrl: "http://localhost:3000",
        REACT_APP_NODE_API: "http://localhost:4000/api",
        googleAuthUrl: `https://accounts.google.com/o/oauth2/v2/auth`,
        googleClientId: "229876868942-31jakcq1lqsn2joo72624bmndemq3js5.apps.googleusercontent.com"
        
    },
    prod : {
        appUrl: process.env.REACT_APP_URL,
        REACT_APP_NODE_API: process.env.REACT_APP_NODE_API,
        googleAuthUrl: process.env.REACT_APP_GOOGLE_AUTH_URL ,
        googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID
    }
};

const config = process.env.NODE_ENV === "development" ? _config.dev: _config.prod;
module.exports = config;