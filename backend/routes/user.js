const router = require('express').Router();
const User = require('../models/user');
const UserSettings = require('../models/userSettings');
const http = require('../utils/http');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const config = require('../app.config');

router.post('/login', auth({block: false}), async (req, res) => {

    const code = req.body.code;
    const provider = req.body.provider;

    if (!code || !provider) return res.sendStatus(400);
    if (!Object.keys(config.auth).includes(provider)) return res.sendStatus(400);

    const response = await http.post(config.auth[provider].tokenEndpoint, {
        "code": code,
        "client_id": config.auth[provider].clientId,
        "client_secret": config.auth[provider].clientSecret,
        "redirect_uri": config.auth[provider].redirectUri,
        "grant_type": "authorization_code",
    }, {
        headers: {
            "Accept": "application/json",
        }
    });

    if (!response) return res.sendStatus(500);
    if (response.status !== 200) return res.sendStatus(401);

    let openId;
    if (!response.data.id_token) {
        const userResponse = await http.get(config.auth[provider].userTokenEndpoint, {
            headers: {
                Authorization: `Bearer ${response.data.access_token}`
            }
        });
        if (!userResponse) return res.sendStatus(500);
        if (userResponse.status !== 200) return res.sendStatus(401);

        openId = userResponse.data[config.auth[provider].userId];
    } else {
        const decoded = jwt.decode(response.data.id_token);
        if (!decoded) return res.sendStatus(500);

        openId = decoded.sub
    };

    const user = await User.findOne({[`providers.${provider}`]: openId});

    if (user && res.locals.user?.providers) {
        user.providers = {
            ...user.providers,
            ...res.locals.user.providers
        };
        await user.save();
    };

    const token = jwt.sign({
        "userId": user?._id,
        "username": user?.username,
        "providers": user ? user.providers : {[provider]: openId}
    }, process.env.JWT_SECRET, {expiresIn: '1d'});
    
    res.json(token);
});


router.post('/create', auth({block: true}), async (req, res) => {
    if (!req.body?.username) return res.sendStatus(400);

    const user = await User.create({
        username: req.body.username, 
        providers: res.locals.user.providers 
    });

    const userSettings = await UserSettings.create({
        userId: user._id
    });

    if (!user || !userSettings) return res.status(500).send('Error creating user or user settings.');

    const token = jwt.sign({
        "userId": user._id,
        "username": user.username,
        "providers": user.providers
    }, process.env.JWT_SECRET, {expiresIn: '1d'})

    res.json(token);
});

module.exports = router;