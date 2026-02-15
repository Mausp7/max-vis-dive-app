const GasMix = require('./GasMix');
const Model = require('./Model');
const Planner = require("./Planner");
const { getPressure, getDepthChange, getGasConsumption } = require("./Utils");

class Dive {
    constructor() {
        this._model = new Model();
        this._planner = new Planner();
    }


    dive(dives, gases = {bottomMix : new GasMix(0.21)}, descentSpeed = 18, ascentSpeed = 9, gasConsumption = {dive: 20, deco: 16}, gradFLow = 0.4, gradFHigh = 0.75) {
        this._model.reset();

        const diveData = this.simulateDive(dives, gases, descentSpeed, ascentSpeed, gasConsumption);
        const decoPlan = this._planner.createDecoPlan(this._model, gases, dives[dives.length - 1].depth, ascentSpeed, gasConsumption, gradFLow, gradFHigh);

        return {diveData, decoPlan
        }
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
