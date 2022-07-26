const config = {
    auth: {
        google: {
            clientId : process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: `${process.env.APP_URL}/redirect` || "http://localhost:3000/redirect",
            tokenEndpoint: "https://oauth2.googleapis.com/token",
            grantType: "authorization code",
            userTokenEndpoint: null,
            userId: null
            
        },
        github: {
            clientId : process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            redirectUri:  `${process.env.APP_URL}/redirect` || "http://localhost:3000/redirect",
            tokenEndpoint: "https://github.com/login/oauth/access_token",
            grantType: "authorization code",
            userTokenEndpoint: "https://api.github.com/user",
            userId: "id"
        }
    }
};

module.exports = config;
