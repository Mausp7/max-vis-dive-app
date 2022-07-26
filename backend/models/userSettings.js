const mongoose = require ('mongoose');
const {GasMix} = require('../logic/decompression');
const tissueSettings = require('../logic/tissueSettings');

const userSettingsSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    ascentSpeed: {type: Number, required: true, default: 9},
    descentSpeed: {type: Number, required: true, default: 18},
    gradFLow: {type: Number, required: true, default: 1},
    gradFHigh: {type: Number, required: true, default: 1},
    gasConsumption: {
        dive: {type: Number, required: true, default: 20},
        deco: {type: Number, required: true, default: 16}
    },
    gasMixes: [
        {        
            o2: Number,
            he2: Number,
            n2: Number,
            diveMod: Number,
            decoMod: Number,
        }
    ],
    
    tissues: {type: Array, required: true, default: tissueSettings},
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

module.exports = UserSettings;