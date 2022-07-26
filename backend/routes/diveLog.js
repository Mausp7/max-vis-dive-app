const router = require('express').Router();
const auth = require('../middlewares/auth');
const DiveLog = require('../models/diveLog')

// GET all diveLogs, or query by site
router.get('/', auth({block: true}), async (req, res) => {
    const diveLogs = await DiveLog.find({ userId: res.locals.user.userId, site: new RegExp(req.query.site, "i") })
        .sort({time: -1})
        .skip(req.query.page? (req.query.page - 1) * 10 : 0)
        .limit(10);
    res.json({diveLogs});
});

// GET diveLog per id
router.get('/:id', auth({block: true}), async (req, res) => {
    const diveLog = await DiveLog.findById(req.params.id);
    if (diveLog?.userId !== res.locals.user.userId) return res.status(404).send("Entry not found.")

    res.json({diveLog});
});


// POST diveLogs
router.post('/', auth({block: true}), async (req, res) => {
    if (!req.body.time || !req.body.duration || !req.body.maxDepth || !req.body.site) return res.status(400).send('Request body must have time, duration, maxDepth and site.')

    let sacRate;
    if (req.body.cylinders[0].size && req.body.cylinders[0].startPressure && req.body.cylinders[0].endPressure && req.body.avgDepth && req.body.duration) {
        sacRate = req.body.cylinders[0].size * ( req.body.cylinders[0].startPressure -  req.body.cylinders[0].endPressure) / (req.body.avgDepth / 10 + 1) / req.body.duration;
    };

    const diveLog = new DiveLog({
        userId: res.locals.user.userId,
        time: req.body.time,
        duration: Number(req.body.duration),
        maxDepth: Number(req.body.maxDepth),
        avgDepth: Number(req.body.avgDepth),
        site: req.body.site,
        waterTemp: Number(req.body.waterTemp),
        weather: req.body.weather,
        cylinders: [...req.body.cylinders],
        gasConsumption: sacRate
    });  

    diveLog.save((err, data) => {
        if (err) return res.status(500).send(err);

        res.json({diveLog: data});
    })
});


// PATCH diveLog per id
router.patch('/:id', auth({block: true}), async (req, res) => {
    const diveLog = await DiveLog.findById(req.params.id);
    if (!diveLog) return res.status(404).send('DiveLog not found.')
    if (diveLog.userId !== res.locals.user.userId) return res.status(403).send('Not authorized to modify this entry.')

    if (!req.body.time && !req.body.duration && !req.body.maxDepth && !req.body.site && !req.body.avgDepth && !req.body.waterTemp && !req.body.weather && !req.body.cylinders && !req.body.gasConsumption) return res.status(400).send('Request body must have at least one entry property to modify.')
    
    if (req.body.time) diveLog.time = req.body.time;
    if (req.body.duration) diveLog.duration = req.body.duration;
    if (req.body.maxDepth) diveLog.maxDepth = req.body.maxDepth;
    if (req.body.avgDepth) diveLog.avgDepth = req.body.avgDepth;
    if (req.body.site) diveLog.site = req.body.site;
    if (req.body.waterTemp) diveLog.waterTemp = req.body.waterTemp;
    if (req.body.weather) diveLog.weather = req.body.weather;
    if (req.body.cylinders) diveLog.cylinders = req.body.cylinders;

    if (req.body.cylinders[0].size && req.body.cylinders[0].startPressure && req.body.cylinders[0].endPressure && req.body.avgDepth && req.body.duration) {
        sacRate = req.body.cylinders[0].size * ( req.body.cylinders[0].startPressure -  req.body.cylinders[0].endPressure) / (req.body.avgDepth / 10 + 1) / req.body.duration;
        diveLog.gasConsumption = sacRate;
    };

    diveLog.save((err, data) => {
        if (err) return res.status(500).send(err);

        res.json({diveLog: data});
    })
});


// Delete diveLog per id
router.delete('/:id', auth({block: true}), async (req, res) => {

    DiveLog.deleteOne({_id: req.params.id, userId: res.locals.user.userId}, (err, data) => {
        if (err) return res.status(500).send(err);
        if (data.deletedCount === 0) return res.status(401).send('Entry not found or user not authorized to delete.')

        res.json({data});
    });
});

module.exports = router;