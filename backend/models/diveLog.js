const mongoose = require ('mongoose');

const diveLogSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    time: {type: Date, required: true},
    duration: {type: Number, required: true},
    maxDepth: {type: Number, required: true},
    avgDepth: {type: Number},
    site: {type: String, required: true},
    waterTemp: {type: Number},
    weather: {type: String},
    cylinders: [{
        size: {type: Number},
        startPressure: {type: Number},
        endPressure: {type: Number},
        gasMix: {type: Object}
    }],
    gasConsumption: {type: Number},
});

const DiveLog = mongoose.model('DiveLog', diveLogSchema);

module.exports = DiveLog;