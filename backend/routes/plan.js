const router = require('express').Router();
const auth = require('../middlewares/auth');
const { GasMix, noDecoLimitTable, goDive } = require('../logic/decompression')


// POST returns the returnvalue of noDecoLimitTable(maxDepth, steps, gasO2, gradientFactor)
router.post('/table', auth({block: false}), async (req, res) => {
    if (!req.body.maxDepth || !req.body.steps || !req.body.gas || !req.body.gradientFactor) return res.status(400).send('Request body must have depth, gasO2, gradientFactor.');

    if (typeof req.body.gas.o2 !== 'number' || typeof req.body.gas.n2 !== 'number' || typeof req.body.gas.diveMod !== 'number') return res.status(400).send('Request body must have gas of class Gas.'); 

    const table = noDecoLimitTable(Number(req.body.maxDepth), Number(req.body.steps), req.body.gas, Number(req.body.gradientFactor));
    res.json(table);
});

// POST returns the returnvalue of goDive(dives, gases, descentSpeed, ascentSpeed)
router.post('/dive', auth({block: true}), async (req, res) => {
    if (!req.body.dives || !req.body.gases || !req.body.descentSpeed || !req.body.ascentSpeed) return res.status(400).send('Request body must have dives, gases, descentSpeed, ascentSpeed.');

    if (typeof req.body.gases.bottomMix.o2 !== 'number' || typeof req.body.gases.bottomMix.n2 !== 'number' || typeof req.body.gases.bottomMix.diveMod !== 'number') return res.status(400).send('Request body must have gasses with values of class Gas.'); 

    const divePlan = goDive(req.body.dives, req.body.gases, req.body.descentSpeed, req.body.ascentSpeed, req.body.gasConsumption, req.body.gradFLow, req.body.gradFHigh);
    res.json(divePlan);
});



module.exports = router;