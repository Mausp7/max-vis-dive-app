const router = require('express').Router();
const auth = require('../middlewares/auth');
const DiveSite = require('../models/diveSite');
const DiveLog = require('../models/diveLog')


// GET all diveSites
router.get('/', auth({block: false}), async (req, res) => {
    const diveSites = await DiveSite.find({ name: new RegExp(req.query.name, "i") })
        .skip(req.query.page? (req.query.page - 1) * 10 : 0)
        .limit(10);
    res.json({diveSites});
});

// GET diveSites per userId
router.get('/user', auth({block: true}), async (req, res) => {
    const diveSites = await DiveSite.find({userId: res.locals.user.userId});

    res.json({diveSites});
});

// GET diveSites per id
router.get('/:id', auth({block: false}), async (req, res) => {
    const diveSite = await DiveSite.findById(req.params.id);

    res.json({diveSite});
});


// POST diveSites
router.post('/', auth({block: true}), async (req, res) => {
    if (!req.body.name || !req.body.country || !req.body.waterBody || !req.body.diveType) return res.status(400).send('Request body must have name, country, waterBody and diveType.')

    const diveSite = new DiveSite({
        userId: res.locals.user.userId,
        name: req.body.name,
        country: req.body.country,
        waterBody: req.body.waterBody,
        diveType: req.body.diveType
    });  

    diveSite.save((err, data) => {
        if (err) return res.status(500).send(err);

        res.json({diveSite: data});
    })
});


// PATCH diveSite per id
router.patch('/:id', auth({block: true}), async (req, res) => {
    const diveSite = await DiveSite.findById(req.params.id);
    if (!diveSite) return res.status(404).send('DiveSite not found.')
    if (diveSite.userId !== res.locals.user.userId) return res.status(403).send('Not authorized to modify this diveSite')

    if (!req.body.name && !req.body.country && !req.body.waterBody && !req.body.diveType) return res.status(400).send('Request body must have at least one of following: name, country, waterBody, diveType.')
    
    if (req.body.name) diveSite.name = req.body.name;
    if (req.body.country) diveSite.country = req.body.country;
    if (req.body.waterBody) diveSite.waterBody = req.body.waterBody;
    if (req.body.diveType) diveSite.diveType = req.body.diveType;

    diveSite.save((err, data) => {
        if (err) return res.status(500).send(err);

        res.json({diveSite: data});
    })
});


// Delete diveSite per id
router.delete('/:id', auth({block: true}), async (req, res) => {
    const inUse = await DiveLog.findOne({site: req.params.id});
    if (inUse) return res.status(409).send("Dive Site in use in Dive Log.")

    DiveSite.deleteOne({_id: req.params.id, userId: res.locals.user.userId}, (err, data) => {
        if (err) return res.status(500).send(err);
        if (data.deletedCount === 0) return res.status(401).send('Entry not found or user not authorized to delete.')

        res.json({data});
    });
});

module.exports = router;