const tissueSettings = require('./tissueSettings')

const getMod = (o2, ppO2Max) => {
    return  Math.floor((ppO2Max / o2 - 1) * 100) /10;
};

const GasMix = class {
    constructor(o2 = 0.21, he2 = 0) {
        this.o2 = o2;
        this.he2 = he2;
        this.n2 = Number((1 - o2 - he2).toFixed(2));
        this.diveMod = getMod(this.o2, 1.4);
        this.decoMod =getMod(this.o2, 1.6);
    };
};

const Tissue = class {
    constructor(halfTime, mValue = 2, startPressure = 1, fInertGasStart = 0.79) {
        this.halfTime = halfTime;
        this.mValue = mValue;
        this.fInertGasStart = fInertGasStart;
        //this.originalInertP = startPressure * fInertGasStart;
        this.tissueLoad = startPressure * fInertGasStart;
        this.ceiling = 0;
    };

    dive(ambientPressure, duration, fInertGas, gradFactor = 1) {
        this.tissueLoad += (ambientPressure * fInertGas - this.tissueLoad) * (1 - 0.5**(duration / this.halfTime));
        const ceiling =  (this.tissueLoad / ((this.mValue - 1) * gradFactor + 1) - 1) * 10;
        this.ceiling = ceiling > 0 ? ceiling : 0;
    };
};

const setTissues = (tissues = tissueSettings) => {
    const compartments = [];

    for (const t of tissues) {
        compartments.push(new Tissue(t.halfTime, t.mValue));
    };
    return compartments;
};

const noDecompressionLimit = (depth, gas, gradientFactor) => {
    compartments = setTissues();
    ambientPressure = (depth / 10) + 1;
    limits = [];

    for (const c of compartments) {
        if (ambientPressure * gas.n2 > c.mValue * gradientFactor) {
            let limit = -1;
            while (c.tissueLoad <= c.mValue * gradientFactor) {
                c.dive(ambientPressure, 1, gas.n2, gradientFactor);
                limit += 1;
            }
            limit > -1 ? limits.push(limit) : null;
        };
    };

    return limits.length === 0 ? null : limits.reduce((min, limit) => limit < min ? limit : min);
};

const noDecoLimitTable = (maxDepth = 40, steps = 3, gas = new GasMix(0.21), gradientFactor = 1) => {
    const diveTable = {table: []};

    for (let depth = 6; depth <= maxDepth; depth += steps) {
        const limit = noDecompressionLimit(depth, gas, gradientFactor)
        diveTable.mod = gas.diveMod;

        if (depth > gas.diveMod) {
            break;;
        } else if (limit === null) {
            diveTable.table.push({depth, limit})
        } else {
            diveTable.table.push({depth, limit})
        };
    };

    return diveTable;
};

const decoPlan = (compartments, startDepth, gases, ascentSpeed, gasConsumption, gradFLow, gradFHigh) => {
    let lowestCeiling = compartments.reduce((lowest, compartment) => compartment.ceiling > lowest ? compartment.ceiling : lowest, 0);
    if (lowestCeiling === 0) return [];
    
    let decoPlan = [];
    let decoStartDepth = Math.ceil(lowestCeiling / 3) * 3;
    let actualDepth = startDepth;
    let actualPressure = (startDepth / 10) + 1;
    let gradF = gradFLow;
    const gradInc = (gradFHigh - gradFLow) / (decoStartDepth / 3);

    while (actualDepth > 0) {    
        let decoTime = 0;
        gradF += gradInc;
    
        while (lowestCeiling > decoStartDepth - 3) {
            const ceilings = [];
            const decoStartPressure = (decoStartDepth / 10) + 1
            const depthChangeDuration = Math.ceil((actualDepth - decoStartDepth) / ascentSpeed);
            const depthChangePressure = (actualPressure + decoStartPressure) / 2;

            if( depthChangeDuration !== 0) {
                decoPlan.push({action: "ascent", depth: Number(decoStartDepth.toFixed(0)), duration: depthChangeDuration, gases, gasConsumption: Math.ceil(gasConsumption.deco * depthChangeDuration * depthChangePressure)});
                
                for (const compartment of compartments) {
                    compartment.dive(depthChangePressure, depthChangeDuration, gases.bottomMix.n2, gradF)
                    ceilings.push(compartment.ceiling);
                };

                actualPressure = decoStartPressure;
                actualDepth = decoStartDepth;

            } else {
                for (const compartment of compartments) {
                    compartment.dive(actualPressure, 1, gases.bottomMix.n2, gradF)
                    ceilings.push(compartment.ceiling)
                };

                decoTime += 1;
            };
            
            lowestCeiling = ceilings.reduce((lowest, ceiling) => lowest > ceiling ? lowest : ceiling, 0);
            if (decoStartDepth === 0) break;
        };

        if (decoTime > 0) {
            decoPlan.push({action:"stop", depth: Number(actualDepth.toFixed(0)), duration: decoTime, gases, gasConsumption: Math.ceil(gasConsumption.deco * decoTime * actualPressure)});
        };
        
        decoStartDepth -= 3;
    };

    return decoPlan;
};


const goDive = (dives, gases = {bottomMix : new GasMix(0.21)}, descentSpeed = 18, ascentSpeed = 9, gasConsumption = {dive: 20, deco: 16}, gradFLow = 1, gradFHigh = 1) => {
    const tissues = setTissues();
    let startPressure = 1;
    let startDepth = 0;

    for (const dive of dives) {
        const ceilings = [];
        const ambientPressure = (dive.depth / 10) + 1;
        const depthChangeDuration = Math.ceil(startDepth < dive.depth 
            ? (dive.depth - startDepth) / descentSpeed
            : (startDepth - dive.depth) / ascentSpeed);

        const depthChangePressure = (ambientPressure + startPressure) / 2
        startPressure = ambientPressure
        startDepth = dive.depth

        for (const tissue of tissues) {
            tissue.dive(depthChangePressure, depthChangeDuration, gases.bottomMix.n2, gradFLow)
            tissue.dive(ambientPressure, dive.duration - depthChangeDuration, gases.bottomMix.n2, gradFLow)
            ceilings.push(tissue.ceiling)
        }
        const lowestCeiling = ceilings.reduce((lowest, ceiling) => lowest > ceiling ? lowest : ceiling, 0);

        dive.gas = gases.bottomMix;
        dive.gasConsumption = Math.ceil(gasConsumption.dive * (depthChangePressure * depthChangeDuration + ambientPressure * (dive.duration - depthChangeDuration)));
        if (dive.depth > gases.bottomMix.diveMod) {dive.alert = {mod: gases.bottomMix.diveMod}};

        dive.ceiling = parseFloat(lowestCeiling.toFixed(1));
    };

    const divePlan = {
        dives,
        decoPlan: decoPlan(tissues, startDepth, gases, ascentSpeed, gasConsumption, gradFLow, gradFHigh)
    }
    return divePlan;
};


module.exports = { GasMix, noDecoLimitTable, goDive };