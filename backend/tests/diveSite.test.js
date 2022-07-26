require('dotenv').config();
const app = require('../app')
const mockserver = require('supertest');
const mongoose = require('mongoose');
const DiveSite = require('../models/diveSite');
const {startVirtualDb, stopVirtualDb, clearDb} = require('./utils/inMemoryDb');
const jwt = require("jsonwebtoken");

describe('/api/divesite GET tests', () => {
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

    afterEach(async () => await clearDb(DiveSite));


    it('should return an empty array if DB is emprty.', async () => {
        //given

        //when
        const response = await client.get('/api/divesite')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({diveSites: []});
    });

    it('should return a entry if one in DB.', async () => {
        //given
        const diveSite = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite.save();

        //when
        const response = await client.get('/api/divesite')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSites).toHaveLength(1);
        expect(response.body.diveSites[0].name).toBe(diveSite.name);
    });

    it('should return 1 matching entry if one is present in DB.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();

        //when
        const response = await client.get('/api/divesite?name=site')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSites).toHaveLength(1);
        expect(response.body.diveSites[0].name).toBe(diveSite1.name);
    });

    it('should return 2 matching entries if 2 present in DB.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();
        const diveSite3 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite3.save();

        //when
        const response = await client.get('/api/divesite?name=test')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSites).toHaveLength(2);
        expect(response.body.diveSites[0].name).toBe(diveSite1.name);
        expect(response.body.diveSites[1].name).toBe(diveSite2.name);
    });

    it('should return 10 entries if 11 present in DB.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();
        const diveSite3 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite3.save();
        const diveSite4 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite4.save();
        const diveSite5 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite5.save();
        const diveSite6 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite6.save();
        const diveSite7 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite7.save();
        const diveSite8 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite8.save();
        const diveSite9 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite9.save();
        const diveSite10 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite10.save();
        const diveSite11 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite11.save();

        //when
        const response = await client.get('/api/divesite')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSites).toHaveLength(10);
        expect(response.body.diveSites[0].name).toBe(diveSite1.name);
        expect(response.body.diveSites[9].name).toBe(diveSite10.name);
    });

    it('should return 1 entry if 11 present in DB and 2nd page querried.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();
        const diveSite3 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite3.save();
        const diveSite4 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite4.save();
        const diveSite5 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite5.save();
        const diveSite6 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite6.save();
        const diveSite7 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite7.save();
        const diveSite8 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite8.save();
        const diveSite9 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite9.save();
        const diveSite10 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite10.save();
        const diveSite11 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite11.save();

        //when
        const response = await client.get('/api/divesite?page=2')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSites).toHaveLength(1);
        expect(response.body.diveSites[0].name).toBe(diveSite11.name);
    });

    it('should return 6 entries if 6 matches the querry in DB.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();
        const diveSite3 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite3.save();
        const diveSite4 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite4.save();
        const diveSite5 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite5.save();
        const diveSite6 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite6.save();
        const diveSite7 = new DiveSite({
            userId: "123456",
            name: "site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite7.save();
        const diveSite8 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite8.save();
        const diveSite9 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite9.save();
        const diveSite10 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite10.save();
        const diveSite11 = new DiveSite({
            userId: "123456",
            name: "spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite11.save();

        //when
        const response = await client.get('/api/divesite?name=tes')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSites).toHaveLength(6);
    });

    it('should return null if searched by id in DB and not present..', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();
        const diveSite3 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });

        //when
        const response = await client.get(`/api/divesite/${diveSite3._id}`)
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSite).toBe(null);
    });

    it('should return empty object if authorization header is missing.', async () => {
        //given

        //when
        const response = await client.get(`/api/divesite/user`)
        
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
        expect(response.body).toStrictEqual({});
    });


    it('should return empty divesites array if searched by user id in DB and not found.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();
        const diveSite3 = new DiveSite({
            userId: "789456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite3.save();

        const token = jwt.sign({userId: "12345645"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get(`/api/divesite/user`)
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSites).toStrictEqual([]);
    });
    
    it('should return 1 matching entry if searched by id in DB and present.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();
        const diveSite3 = new DiveSite({
            userId: "123456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite3.save();

        //when
        const response = await client.get(`/api/divesite/${diveSite2._id}`)
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSite.name).toBe(diveSite2.name);
        expect(response.body.diveSite._id).toBe(diveSite2._id.toString());

    });

    it('should return 2 matching entries if searched by user id in DB and present.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();
        const diveSite3 = new DiveSite({
            userId: "789456",
            name: "dive spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite3.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get(`/api/divesite/user`)
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveSites).toHaveLength(2);

        expect(response.body.diveSites[0].name).toBe(diveSite1.name);
        expect(response.body.diveSites[0]._id).toBe(diveSite1._id.toString());
        expect(response.body.diveSites[1].name).toBe(diveSite2.name);
        expect(response.body.diveSites[1]._id).toBe(diveSite2._id.toString());
    });
});


describe('/api/divesite POST tests', () => {
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

    afterEach(async () => await clearDb(DiveSite));


    it('should respond with status 401 if authorization header is invalid.', async () => {
        //given

        //when
        const response = await client.post(`/api/divesite`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
        const diveSite = await DiveSite.findOne();
        expect(diveSite).toBe(null);
    }); 

    it('should respond with status 401 if request body is missing.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/divesite`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have name, country, waterBody and diveType.');
        const diveSite = await DiveSite.findOne();
        expect(diveSite).toBe(null);
    }); 

    it('should respond with status 401 if request body is invalid.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/divesite`).send({
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have name, country, waterBody and diveType.');
        const diveSite = await DiveSite.findOne();
        expect(diveSite).toBe(null);
    }); 

    it('should respond with status 200, and the db should contain the entry with an id, if a proper request arrives when the db is empty.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/divesite`).send({
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
    
        //then
        expect(response.status).toBe(200);
        const diveSite = await DiveSite.findOne();
        expect(diveSite.userId).toBe(response.body.diveSite.userId);
        expect(diveSite.name).toBe(response.body.diveSite.name);
        expect(diveSite.country).toBe(response.body.diveSite.country);
        expect(diveSite._id).not.toBe(response.body.diveSite._id);
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

    afterEach(async () => await clearDb(DiveSite));

    it('should respond with status 404 if no id present.', async () => {
        //given

        //when
        const response = await client.patch(`/api/divesite`);
    
        //then
        expect(response.status).toBe(404);
    }); 

    it('should respond with status 401 if authorization header is invalid.', async () => {
        //given

        //when
        const response = await client.patch(`/api/divesite/invalidId`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
    }); 

    it('should respond with status 404 if entry not found.', async () => {
        //given
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divesite/${diveSite2._id}`);
    
        //then
        expect(response.status).toBe(404);
        expect(response.text).toBe('DiveSite not found.');
        const diveSite = await DiveSite.findById(diveSite2._id);
        expect(diveSite).toBe(null);
    }); 

    it(`should respond with status 403 if userId doesn't match authorization header.`, async () => {
        //given

        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();

        const token = jwt.sign({userId: "12345"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divesite/${diveSite2._id}`);
    
        //then
        expect(response.status).toBe(403);
        expect(response.text).toBe('Not authorized to modify this diveSite');
    }); 

    it('should respond with status 400 if request body is missing.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divesite/${diveSite2._id}`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have at least one of following: name, country, waterBody, diveType.');
    }); 

    it('should respond with status 400 if request body is invalid.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "123456",
            name: "test spot",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divesite/${diveSite2._id}`).send({
            county: "test country",
            watrBody: "wet water",
            diveype: "test dive"
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have at least one of following: name, country, waterBody, diveType.');
    }); 

    it('should respond with status 200, and the db should contain the modified entry, if a proper request arrives.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divesite/${diveSite1._id}`).send({
            name: "tested site",
            country: "tested country",
            waterBody: "tested water",
            diveType: "tested dive"
        });
    
        //then
        expect(response.status).toBe(200);
        const diveSite = await DiveSite.findOne();
        expect(response.body.diveSite.userId).toBe("123456");
        expect(response.body.diveSite.name).toBe("tested site");
        expect(response.body.diveSite.country).toBe("tested country");
        expect(response.body.diveSite.waterBody).toBe("tested water");
        expect(response.body.diveSite.diveType).toBe("tested dive");
        expect(diveSite.userId).toBe(response.body.diveSite.userId);
        expect(diveSite.name).toBe(response.body.diveSite.name);
        expect(diveSite.country).toBe(response.body.diveSite.country);
        expect(diveSite.waterBody).toBe(response.body.diveSite.waterBody);
        expect(diveSite.diveType).toBe(response.body.diveSite.diveType);
        expect(diveSite._id.toString()).toBe(response.body.diveSite._id);
    }); 
});


describe('/api/divesite DELETE tests', () => {
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

    afterEach(async () => await clearDb(DiveSite));


    it('should respond with status 403, and the db should have 1 entry after trying to delete without authorization.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();

        //when
        const response = await client.delete(`/api/divesite/${diveSite1._id}`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
        const diveSite = await DiveSite.findOne();
        expect(diveSite).not.toBe(null);
        expect(diveSite._id.toString()).toBe(diveSite1._id.toString());
    }); 

    it('should respond with status 401, and the db should have 1 entry after trying to delete with invalid authorization.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();

        const token = jwt.sign({userId: "123456"}, 'badSecret');
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divesite/${diveSite1._id}`);
    
        //then
        expect(response.status).toBe(401);
        const diveSite = await DiveSite.findOne();
        expect(diveSite).not.toBe(null);
        expect(diveSite._id.toString()).toBe(diveSite1._id.toString());
    }); 

    it('should respond with status 401, and the db should have 1 entry after trying to delete with an unauthorized userId.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });

        await diveSite1.save();

        const token = jwt.sign({userId: "123457"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divesite/${diveSite1._id}`);
    
        //then
        expect(response.status).toBe(401);
        expect(response.text).toBe('Entry not found or user not authorized to delete.');
        const diveSite = await DiveSite.findOne();
        expect(diveSite).not.toBe(null);
        expect(diveSite._id.toString()).toBe(diveSite1._id.toString());
    }); 

    it('should respond with status 401, and the db should have 1 entry after trying to delete a non-existing entry.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        const diveSite2 = new DiveSite({
            userId: "1234567",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divesite/${diveSite1._id}`);
    
        //then
        expect(response.status).toBe(401);
        expect(response.text).toBe('Entry not found or user not authorized to delete.');
        const diveSite = await DiveSite.findOne();
        expect(diveSite).not.toBe(null);
        expect(diveSite._id.toString()).toBe(diveSite2._id.toString());
    }); 

    it('should respond with status 200, and the db should have 1 entry after deleting the one existing entry.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        const diveSite2 = new DiveSite({
            userId: "1234567",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divesite/${diveSite1._id}`);
    
        //then
        expect(response.status).toBe(200);
        const diveSite = await DiveSite.findOne();
        expect(diveSite).not.toBe(null);
        expect(diveSite._id.toString()).toBe(diveSite2._id.toString());
    }); 

    it('should respond with status 200, and the db should be empty after deleting the only existing entry.', async () => {
        //given
        const diveSite1 = new DiveSite({
            userId: "123456",
            name: "test site",
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
        await diveSite1.save();
        

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divesite/${diveSite1._id}`);
    
        //then
        expect(response.status).toBe(200);
        const diveSite = await DiveSite.findOne();
        expect(diveSite).toBe(null);
    }); 
});

