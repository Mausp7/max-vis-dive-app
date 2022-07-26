const router = require('express').Router();
const auth = require('../middlewares/auth');
const UserSettings = require('../models/userSettings');
const { GasMix } = require('../logic/decompression');

// GET all userSettings
router.get('/', auth({block: true}), async (req, res) => {
    const userSettings = await UserSettings.findOne({ userId: res.locals.user.userId });

    if ( !userSettings ) return res.status(404).send('UserSettings not found.');

    res.json({userSettings});
});


//POST new GasMix
router.post('/gasmix', auth({block: true}), async (req, res) => {
    if (!req.body.o2) return res.status(400).send('Body must have o2 parameter.');
    
    if (isNaN(req.body.o2)) return res.status(400).send('o2 parameter must be a number.');

    if (req.body.o2 < 0.01 || req.body.o2 > 1) return res.status(400).send('o2 parameter must be berween 0.01 and 1.');

    if (req.body.he2 && isNaN(req.body.he2)) return res.status(400).send('he2 parameter must be a number.');

    if (req.body.he2 && (req.body.he2 < 0.01 || req.body.he2 > 0.99)) return res.status(400).send('he2 query must be berween 0.01 and 0.99.');

    
    const userSettings = await UserSettings.findOne({ userId: res.locals.user.userId });
    if ( !userSettings ) return res.status(404).send('UserSettings not found.');

    const o2 = Number(req.body.o2);
    const he2 = req.body.he2 ? Number(req.body.he2) : 0;

    const existingGasMix = userSettings.gasMixes.filter(gasMix => gasMix.o2 === o2 && gasMix.he2 === he2);

    if (existingGasMix.length !== 0) return res.status(409).send('Breathing gas already exists.');

    userSettings.gasMixes.push(new GasMix(o2, he2));

    userSettings.save((err, data) => {
        if (err) return res.status(500).send(err);

        res.json({userSettings: data});
    });
});


// PATCH userSettings per userId
router.patch('/', auth({block: true}), async (req, res) => {
    const userSettings = await UserSettings.findOne({ userId: res.locals.user.userId });
    if (!userSettings) return res.status(404).send('UserSettings not found.');

    if (
        !req.body.ascentSpeed &&
        !req.body.descentSpeed &&
        !req.body.gradFLow &&
        !req.body.gradFHigh &&
        !req.body.gasConsumption &&
        typeof req.body.gasMixes !== "object" &&
        typeof req.body.tissues !== "object"
    ) return res.status(400).send('Request body must have at least one entry property to modify, and gasMixes has to be an array of classes of GasMix.')
    
    if (req.body.ascentSpeed && req.body.ascentSpeed > 1 && req.body.ascentSpeed < 20) userSettings.ascentSpeed = req.body.ascentSpeed;
    if (req.body.descentSpeed && req.body.descentSpeed > 1 && req.body.descentSpeed < 50) userSettings.descentSpeed = req.body.descentSpeed;
    if (req.body.gradFLow && req.body.gradFLow > 0 && req.body.gradFLow <= 1) userSettings.gradFLow = req.body.gradFLow;
    if (req.body.gradFHigh && req.body.gradFHigh > 0 && req.body.gradFHigh <= 1) userSettings.gradFHigh = req.body.gradFHigh;
    if (req.body.gasMixes) userSettings.gasMixes = req.body.gasMixes;
    if (req.body.tissues) userSettings.tissues = req.body.tissues;
    if (req.body.gasConsumption) userSettings.gasConsumption = req.body.gasConsumption;

    userSettings.save((err, data) => {
        if (err) return res.status(500).send(err);

        res.json({userSettings: data});
    })
});


//DELETE GasMix
router.delete('/gasmix/:o2', auth({block: true}), async (req, res) => {
    if (isNaN(req.params.o2)) return res.status(400).send('Query must have a number o2 parameter.');
    
    if (req.params.o2 < 0.01 || req.params.o2 > 1) return res.status(400).send('o2 parameter must be berween 0.01 and 1.');

    if (req.query.he2 && isNaN(req.query.he2)) return res.status(400).send('Query parameter he2 must be a number if defined.');

    if (req.query.he2 && (req.query.he2 < 0.01 || req.query.he2 > 0.99)) return res.status(400).send('he2 query must be berween 0.01 and 0.99.');

    const userSettings = await UserSettings.findOne({ userId: res.locals.user.userId });

    if ( !userSettings ) return res.status(404).send('UserSettings not found.');

    const o2 = Number(req.params.o2);
    const he2 =  req.query.he2 ? Number(req.query.he2) : 0;
    
    userSettings.gasMixes = userSettings.gasMixes.filter(gas =>  !(gas.o2 === o2 && gas.he2 === he2));

    userSettings.save((err, data) => {
        if (err) return res.status(500).send(err);

        res.json({userSettings: data});
    });
});


module.exports = router;