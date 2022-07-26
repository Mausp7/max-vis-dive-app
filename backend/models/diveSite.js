const mongoose = require ('mongoose');

const diveSiteSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    name: {type: String, required: true},
    country: {type: String, required: true},
    waterBody: {type: String, required: true},
    diveType: {type: String, required: true},
});

const DiveSite = mongoose.model('DiveSite', diveSiteSchema);

module.exports = DiveSite;