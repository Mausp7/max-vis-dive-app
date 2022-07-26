require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app')
const port = process.env.PORT || 4000;

mongoose.connect(process.env.CONNECTION_STRING);

app.listen(port, () => {
    console.log(`Listening at ${port}`)
});
