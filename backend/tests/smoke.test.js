require('dotenv').config();
const app = require('../app')
const mockserver = require('supertest');
const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');


function sum(a, b) {
    return a + b;
};

test('testing environment cofigured', () => {
    // given
    // no setup required

    // when
    const result = sum(1, 2);

    // then
    expect(result).toBe(3);
});

test('/ returns 200 status code', async () => {
    //given
    const server = mockserver(app);

    //when
    const response = await server.get('/');

    //then
    expect(response.status).toBe(200);
});

test('MongoMemoryServer is online', async () => {
    //given
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const connection = await mongoose.connect(uri);
    
    const kittySchema = new mongoose.Schema({
        name: String
    });
    const Kitten = mongoose.model('Kitten', kittySchema);
    const cat = new Kitten({name: "Fluffy"});

    //when
    await cat.save();

    //then
    const foundCat = await Kitten.findOne()
    expect(foundCat.name).toBe('Fluffy');
    await connection.disconnect();
    await mongod.stop();
});