require('dotenv').config();
const app = require('../app')
const mockserver = require('supertest');
const mongoose = require('mongoose');
const UserSettings = require('../models/userSettings');
const { GasMix } = require('../logic/decompression');
const tissueSettings = require('../logic/tissueSettings');
const {startVirtualDb, stopVirtualDb, clearDb} = require('./utils/inMemoryDb');
const jwt = require("jsonwebtoken");


describe('/api/settings GET tests', () => {
    let connection;
    let mongodb;
    let client;

    beforeAll(async () => {
        const result = await startVirtualDb();
        connection = result.connectionVirtualMongoDb;
        mongodb = result.virtualMongoDb;
    
        client = mockserver.agent(app);
    });

    afterAll(async () => await stopVirtualDb(connection, mongodb));

    afterEach(async () => await clearDb(UserSettings));

    it('should respond with status 401 if authorization header is missing.', async () => {
        //given

        //when
        const response = await client.get(`/api/settings`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
    }); 

    it('should respond with status 401 if authorization header is invalid.', async () => {
        //given
        const token = jwt.sign({userId: "12345645"}, "badSecret");
        client.set('authorization', token);

        //when
        const response = await client.get(`/api/settings`);
    
        //then
        expect(response.status).toBe(401);
    }); 

    it('should return 404 array if entry not found.', async () => {
        //given
        const token = jwt.sign({userId: "12345645"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/settings')
        
        //then
        expect(response.status).toBe(404);
        expect(response.text).toBe('UserSettings not found.');
    });

    it('should return an entry if one in DB.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456'
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/settings')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.userSettings.userId).toBe("123456");
        expect(response.body.userSettings.ascentSpeed).toBe(9);
        expect(response.body.userSettings._id.toString()).toBe(userSettings1._id.toString());
    });

    it('should return only one entry if more exist in DB.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456'
        });
        await userSettings1.save();

        const userSettings2 = new UserSettings({
            userId: '123457'
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/settings')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.userSettings.userId).toBe("123456");
        expect(response.body.userSettings.ascentSpeed).toBe(9);
        expect(response.body.userSettings._id.toString()).toBe(userSettings1._id.toString());
    });
});


describe('/api/divesite/gasmix POST tests', () => {
    let connection;
    let mongodb;
    let client;

    beforeAll(async () => {
        const result = await startVirtualDb();
        connection = result.connectionVirtualMongoDb;
        mongodb = result.virtualMongoDb;
    
        client = mockserver.agent(app);
    });

    afterAll(async () => await stopVirtualDb(connection, mongodb));

    afterEach(async () => await clearDb(UserSettings));


    it('should respond with status 401 if authorization header is missing.', async () => {
        //given

        //when
        const response = await client.post(`/api/settings/gasmix`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
        const userSettings = await UserSettings.findOne();
        expect(userSettings).toBe(null);
    }); 

    it('should respond with status 400 if request body o2 is missing.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/settings/gasmix`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Body must have o2 parameter.');
        const userSettings = await UserSettings.findOne();
        expect(userSettings).toBe(null);
    }); 

    it('should respond with status 400 if request body has invalid o2 parameter.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/settings/gasmix`).send({
            o2: "bad"
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('o2 parameter must be a number.');
        const userSettings = await UserSettings.findOne();
        expect(userSettings).toBe(null);
    }); 

    it('should respond with status 400 if request body has invalid he2 parameter.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/settings/gasmix`).send({
            o2: 0.21,
            he2: "bad"
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('he2 parameter must be a number.');
        const userSettings = await UserSettings.findOne();
        expect(userSettings).toBe(null);
    });

    it('should respond with status 404 if userSettings are not foound with the userId.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456'
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "12356"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/settings/gasmix`).send({
            o2: 0.21,
            he2: 0.19
        });
    
        //then
        expect(response.status).toBe(404);
        expect(response.text).toBe('UserSettings not found.');
    }); 

    it('should respond with status 200, and the db should contain the entry with an id, if a proper request arrives.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456'
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/settings/gasmix`).send({
            o2: 0.21,
            he2: 0.19
        });
    
        //then
        expect(response.status).toBe(200);
        const userSettings = await UserSettings.findOne();
        expect(userSettings.gasMixes[0].o2).toBe(0.21);
        expect(userSettings.gasMixes[0].he2).toBe(0.19);
        expect(userSettings.gasMixes[0]._id).toBeDefined();
        expect(userSettings.gasMixes[0]._id.toString()).toBe(response.body.userSettings.gasMixes[0]._id.toString());
    }); 

    it('should respond with status 200, and the db should contain the entry with an id, if a proper request arrives and there was an entry.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456',
            gasMixes: [new GasMix(0.32)]
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/settings/gasmix`).send({
            o2: 0.21,
            he2: 0.19
        });
    
        //then
        expect(response.status).toBe(200);
        const userSettings = await UserSettings.findOne();
        expect(userSettings.gasMixes[1].o2).toBe(0.21);
        expect(userSettings.gasMixes[1].he2).toBe(0.19);
        expect(userSettings.gasMixes[1]._id).toBeDefined();
        expect(userSettings.gasMixes[1]._id.toString()).toBe(response.body.userSettings.gasMixes[1]._id.toString());
    }); 
});


describe('/api/divesite PATCH tests', () => {
    let connection;
    let mongodb;
    let client;

    beforeAll(async () => {
        const result = await startVirtualDb();
        connection = result.connectionVirtualMongoDb;
        mongodb = result.virtualMongoDb;
    
        client = mockserver.agent(app);
    });

    afterAll(async () => await stopVirtualDb(connection, mongodb));

    afterEach(async () => await clearDb(UserSettings));


    it('should respond with status 400 if authorization header missing.', async () => {
        //given

        //when
        const response = await client.patch(`/api/settings`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
    }); 

    it('should respond with status 401 if authorization header is invalid.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, 'badSecret');
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/settings`);
    
        //then
        expect(response.status).toBe(401);
    }); 

    it('should respond with status 404 if entry not found.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456'
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "1234567"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/settings`);
    
        //then
        expect(response.status).toBe(404);
        expect(response.text).toBe('UserSettings not found.');
        const userSettings = await UserSettings.findOne({userId: "1234567"});
        expect(userSettings).toBe(null);
    }); 

    it('should respond with status 400 if request body is missing.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456'
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/settings`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have at least one entry property to modify, and gasMixes has to be an array of classes of GasMix.');
    }); 

    it('should respond with status 400 if request body is invalid.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456'
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/settings`).send({
            gasMix: new GasMix(0.32) 
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have at least one entry property to modify, and gasMixes has to be an array of classes of GasMix.');
    }); 

    it('should respond with status 200, and the db should contain the modified entry, if a proper request arrives.', async () => {
        const userSettings1 = new UserSettings({
            userId: '123456',
            gasMixes: [new GasMix(0.32)]
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/settings`).send({
            ascentSpeed: 10,
            descentSpeed: 20,
            gradFLow: 0.4,
            gradFHigh: 0.7,
            gasMixes: [new GasMix(0.21, 0.19)],
            tissues: [...tissueSettings, {halfTime: 1000, mValue: 1.15}]
        });
    
        //then
        expect(response.status).toBe(200);
        expect(response.body.userSettings.userId).toBe("123456");
        expect(response.body.userSettings.ascentSpeed).toBe(10);
        expect(response.body.userSettings.descentSpeed).toBe(20);
        expect(response.body.userSettings.gradFLow).toBe(0.4);
        expect(response.body.userSettings.gradFHigh).toBe(0.7);
        expect(response.body.userSettings.gasMixes[0].o2).toBe(0.21);
        expect(response.body.userSettings.gasMixes[0].he2).toBe(0.19);
        expect(response.body.userSettings.tissues[8].halfTime).toBe(1000);
        expect(response.body.userSettings.tissues[8].mValue).toBe(1.15);
        
        const userSettings = await UserSettings.findOne();
        expect(userSettings.userId).toBe(response.body.userSettings.userId);
        expect(userSettings._id.toString()).toBe(response.body.userSettings._id);
        expect(userSettings.ascentSpeed).toBe(response.body.userSettings.ascentSpeed);
        expect(userSettings.descentSpeed).toBe(response.body.userSettings.descentSpeed);
        expect(userSettings.gradFLow).toBe(response.body.userSettings.gradFLow);
        expect(userSettings.gradFHigh).toBe(response.body.userSettings.gradFHigh);
        expect(userSettings.gasMixes[0].o2).toBe(response.body.userSettings.gasMixes[0].o2);
        expect(userSettings.gasMixes[0].he2).toBe(response.body.userSettings.gasMixes[0].he2);
        expect(userSettings.tissues[8].halfTime).toBe(response.body.userSettings.tissues[8].halfTime);
        expect(userSettings.tissues[8].mValue).toBe(response.body.userSettings.tissues[8].mValue);
    }); 
});

describe('/api/divesite/gasmix DELETE tests', () => {
    let connection;
    let mongodb;
    let client;

    beforeAll(async () => {
        const result = await startVirtualDb();
        connection = result.connectionVirtualMongoDb;
        mongodb = result.virtualMongoDb;
    
        client = mockserver.agent(app);
    });

    afterAll(async () => await stopVirtualDb(connection, mongodb));

    afterEach(async () => await clearDb(UserSettings));


    it('should respond with status 401 if authorization header is missing.', async () => {
        //given

        //when
        const response = await client.delete(`/api/settings/gasmix/21`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
        const userSettings = await UserSettings.findOne();
        expect(userSettings).toBe(null);
    }); 

    it('should respond with status 401 if authorization header is invalid.', async () => {
        //given
        const token = jwt.sign({userId: "12356"}, "badSecret");
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/settings/gasmix/0.21`);
    
        //then
        expect(response.status).toBe(401);
        const userSettings = await UserSettings.findOne();
        expect(userSettings).toBe(null);
    }); 

    it('should respond with status 400 if request query o2 is NaN.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/settings/gasmix/bad`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Query must have a number o2 parameter.');
    }); 

    it('should respond with status 400 if request query he2 is given and NaN.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/settings/gasmix/0.21?he2=bad`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Query parameter he2 must be a number if defined.');
    }); 

    it('should respond with status 404 if userSettings are not found with the userId.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456'
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "12356"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/settings/gasmix/0.21?he2=0.19`);
    
        //then
        expect(response.status).toBe(404);
        expect(response.text).toBe('UserSettings not found.');
    }); 

    it('should respond with status 200, and the db should not contain the querried entries, if a proper request arrives.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456',
            gasMixes: [
                new GasMix(0.21), 
                new GasMix(0.32), 
                new GasMix(0.21, 0.19), 
            ]
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/settings/gasmix/0.21`);
    
        //then
        expect(response.status).toBe(200);
        const userSettings = await UserSettings.findOne();
        expect(userSettings.gasMixes).toHaveLength(2);

        expect(userSettings.gasMixes[0].o2).toBe(0.32);
        expect(userSettings.gasMixes[0].he2).toBe(0);
        expect(userSettings.gasMixes[0]._id).toBeDefined();
        expect(userSettings.gasMixes[0]._id.toString()).toBe(response.body.userSettings.gasMixes[0]._id.toString());

        expect(userSettings.gasMixes[1].o2).toBe(0.21);
        expect(userSettings.gasMixes[1].he2).toBe(0.19);
        expect(userSettings.gasMixes[1]._id).toBeDefined();
        expect(userSettings.gasMixes[1]._id.toString()).toBe(response.body.userSettings.gasMixes[1]._id.toString());
    }); 

    it('should respond with status 200, and the db should not contain the specific querried entry, if a proper request arrives.', async () => {
        //given
        const userSettings1 = new UserSettings({
            userId: '123456',
            gasMixes: [
                new GasMix(0.21), 
                new GasMix(0.32, 0.08), 
                new GasMix(0.21, 0.19), 
            ]
        });
        await userSettings1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/settings/gasmix/0.21?he2=0.19`);
    
        //then
        expect(response.status).toBe(200);

        const userSettings = await UserSettings.findOne();
        expect(userSettings.gasMixes).toHaveLength(2);

        expect(userSettings.gasMixes[0].o2).toBe(0.21);
        expect(userSettings.gasMixes[0].he2).toBe(0);
        expect(userSettings.gasMixes[0]._id).toBeDefined();
        expect(userSettings.gasMixes[0]._id.toString()).toBe(response.body.userSettings.gasMixes[0]._id.toString());

        expect(userSettings.gasMixes[1].o2).toBe(0.32);
        expect(userSettings.gasMixes[1].he2).toBe(0.08);
        expect(userSettings.gasMixes[1]._id).toBeDefined();
        expect(userSettings.gasMixes[1]._id.toString()).toBe(response.body.userSettings.gasMixes[1]._id.toString());
    }); 

});

