const GasMix = require('./GasMix');
const Model = require('./Model');
const Planner = require("./Planner");
const { getPressure, getDepthChange, getGasConsumption } = require("./Utils");

class Dive {
    constructor() {
        this._model = new Model();
        this._planner = new Planner();
    }

    simulateDive (dives, gases = {bottomMix : new GasMix(0.21)}, descentSpeed = 18, ascentSpeed = 9, gasConsumption = {dive: 20, deco: 16}, gradFLow = 1, gradFHigh = 1){
        let startDepth = 0;

        for (const dive of dives) {
            const ambientPressure = getPressure(dive.depth);
            const {depthChangeDuration, depthChangePressure} = getDepthChange(startDepth, dive.depth, descentSpeed, ascentSpeed);
            startDepth = dive.depth

            this._model.saturateTissues(depthChangePressure, depthChangeDuration, gases.bottomMix.n2);
            this._model.saturateTissues(ambientPressure, dive.duration - depthChangeDuration, gases.bottomMix.n2)

            dive.gas = gases.bottomMix;

            dive.gasConsumption = getGasConsumption(depthChangePressure, depthChangeDuration, ambientPressure, dive.duration, gasConsumption.dive);

            if (dive.depth > gases.bottomMix.diveMod) {
                dive.alert = {mod: gases.bottomMix.diveMod}
            }

            dive.ceiling = this._model.ceiling;
        }

        return dives;
    }

    dive(dives, gases = {bottomMix : new GasMix(0.21)}, descentSpeed = 18, ascentSpeed = 9, gasConsumption = {dive: 20, deco: 16}, gradFLow = 0.4, gradFHigh = 0.75) {
        this._model.reset();

        const diveData = this.simulateDive(dives, gases, descentSpeed, ascentSpeed, gasConsumption);
        const decoPlan = this._planner.createDecoPlan(this._model, gases, dives[dives.length - 1].depth, ascentSpeed, gasConsumption, gradFLow, gradFHigh);

        return {diveData, decoPlan
        }
    }

    noDecompressionDive(maxDepth = 40, steps = 3, gasMix = new GasMix(0.21), gradientFactor = 1) {
        return this._planner.createDiveTable(this._model, maxDepth, steps, gasMix, gradientFactor);
    }
}

module.exports = Dive;



const plan = new Plan()

const dives = [
    {depth: 50, duration: 15},
    // {depth: 30, duration: 20},
];

const gases = {bottomMix : new GasMix(0.21)};

console.clear();
console.log(plan.dive(dives, gases));
// console.log(plan.noDecompressionDive(40, 3, new GasMix(0.21), 0.97));
