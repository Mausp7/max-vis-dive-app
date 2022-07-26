require('dotenv').config();
const app = require('../app')
const mockserver = require('supertest');
const mongoose = require('mongoose');
const DiveLog = require('../models/diveLog');
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

    afterEach(async () => await clearDb(DiveLog));

    it('should respond with status 401 if authorization header is missing.', async () => {
        //given

        //when
        const response = await client.post(`/api/divelog`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
    }); 

    it('should respond with status 401 if authorization header is invalid.', async () => {
        //given
        const token = jwt.sign({userId: "12345645"}, "badSecret");
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/divelog`);
    
        //then
        expect(response.status).toBe(401);
    }); 

    it('should return an empty array if DB is emprty.', async () => {
        //given
        const token = jwt.sign({userId: "12345645"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/divelog')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({diveLogs: []});
    });

    it('should return empty array, if user does not have an entry in DB.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();

        const token = jwt.sign({userId: "1234567"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/divelog')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveLogs).toStrictEqual([]);
    });

    it('should return an entry if one in DB.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/divelog')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveLogs).toHaveLength(1);
        expect(response.body.diveLogs[0].site).toBe(diveLog1.site);
        expect(response.body.diveLogs[0]._id.toString()).toBe(diveLog1._id.toString());
    });

    it('should return 1 matching entry if one is present in DB.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/divelog?site=Viuda')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveLogs).toHaveLength(1);
        expect(response.body.diveLogs[0].site).toBe(diveLog2.site);
    });

    it('should return 2 matching entries if 2 present in DB.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/divelog')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveLogs).toHaveLength(2);
        expect(response.body.diveLogs[0].site).toBe(diveLog2.site);
        expect(response.body.diveLogs[1].site).toBe(diveLog1.site);
    });

    it('should return 10 entries if 11 present in DB.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();
        const diveLog3 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog3.save();
        const diveLog4 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog4.save();
        const diveLog5 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog5.save();
        const diveLog6 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog6.save();
        const diveLog7 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog7.save();
        const diveLog8 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog8.save();
        const diveLog9 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog9.save();
        const diveLog10 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog10.save();
        const diveLog11 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog11.save();
        const diveLog12 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog12.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);


        //when
        const response = await client.get('/api/divelog')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveLogs).toHaveLength(10);
        expect(response.body.diveLogs[0].dite).toBe(diveLog1.dite);
        expect(response.body.diveLogs[9].dite).toBe(diveLog10.dite);
    });

    it('should return 1 entry if 11 present in DB and 2nd page querried.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();
        const diveLog3 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog3.save();
        const diveLog4 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog4.save();
        const diveLog5 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog5.save();
        const diveLog6 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog6.save();
        const diveLog7 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog7.save();
        const diveLog8 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog8.save();
        const diveLog9 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog9.save();
        const diveLog10 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog10.save();
        const diveLog11 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog11.save();
        const diveLog12 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog12.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/divelog?page=2')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveLogs).toHaveLength(2);
        expect(response.body.diveLogs[0].site).toBe(diveLog12.site);
    });

    it('should return 6 entries if 6 matches the querry in DB.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();
        const diveLog3 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog3.save();
        const diveLog4 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog4.save();
        const diveLog5 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog5.save();
        const diveLog6 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog6.save();
        const diveLog7 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog7.save();
        const diveLog8 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog8.save();
        const diveLog9 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog9.save();
        const diveLog10 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog10.save();
        const diveLog11 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog11.save();
        const diveLog12 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog12.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get('/api/divelog?site=Viud')
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveLogs).toHaveLength(6);
    });

    it('should return status 500 if authorization header is missing.', async () => {
        //given

        //when
        const response = await client.get(`/api/divelog/123`)
        
        //then
        expect(response.status).toBe(500);
    });

    it('should return 404 if searched by id in DB and not present.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();
        const diveLog3 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get(`/api/divelog/${diveLog3._id}`)
        
        //then
        expect(response.status).toBe(404);
        expect(response.body).toStrictEqual({});
    });

    it('should return 404 if searched by id in DB user is not the entry owner.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();
        const diveLog3 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog3.save();

        const token = jwt.sign({userId: "1234567"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get(`/api/divelog/${diveLog3._id}`)
        
        //then
        expect(response.status).toBe(404);
        expect(response.body).toStrictEqual({});
    });

    
    it('should return 1 matching entry if searched by id in DB and user is the entry owner.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Viuda",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();
        const diveLog3 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog3.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.get(`/api/divelog/${diveLog2._id}`)
        
        //then
        expect(response.status).toBe(200);
        expect(response.body.diveLog.site).toBe(diveLog2.site);
        expect(response.body.diveLog._id).toBe(diveLog2._id.toString());

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

    afterEach(async () => await clearDb(DiveLog));


    it('should respond with status 401 if authorization header is missing.', async () => {
        //given

        //when
        const response = await client.post(`/api/divelog`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
        const diveLog = await DiveLog.findOne();
        expect(diveLog).toBe(null);
    }); 

    it('should respond with status 401 if request body is missing.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/divelog`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have time, duration, maxDepth and site.');
        const diveLog = await DiveLog.findOne();
        expect(diveLog).toBe(null);
    }); 

    it('should respond with status 401 if request body is invalid.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/divelog`).send({
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have time, duration, maxDepth and site.');
        const diveLog = await DiveLog.findOne();
        expect(diveLog).toBe(null);
    }); 

    it('should respond with status 200, and the db should contain the entry with an id, if a proper request arrives when the db is empty.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/divelog`).send({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
    
        //then
        expect(response.status).toBe(200);
        const diveLog = await DiveLog.findOne();
        expect(diveLog.userId).toBe(response.body.diveLog.userId);
        expect(diveLog.site).toBe(response.body.diveLog.site);
        expect(diveLog._id.toString()).toBe(response.body.diveLog._id);
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

    afterEach(async () => await clearDb(DiveLog));

    it('should respond with status 404 if no id present.', async () => {
        //given

        //when
        const response = await client.patch(`/api/divelog`);
    
        //then
        expect(response.status).toBe(404);
    }); 

    it('should respond with status 401 if authorization header is invalid.', async () => {
        //given

        //when
        const response = await client.patch(`/api/divelog/invalidId`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
    }); 

    it('should respond with status 404 if entry not found.', async () => {
        //given
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divelog/${diveLog2._id}`);
    
        //then
        expect(response.status).toBe(404);
        expect(response.text).toBe('DiveLog not found.');
        const diveLog = await DiveLog.findById(diveLog2._id);
        expect(diveLog).toBe(null);
    }); 

    it(`should respond with status 403 if userId doesn't match authorization header.`, async () => {
        //given

        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();

        const token = jwt.sign({userId: "12345"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divelog/${diveLog2._id}`);
    
        //then
        expect(response.status).toBe(403);
        expect(response.text).toBe('Not authorized to modify this entry.');
    }); 

    it('should respond with status 400 if request body is missing.', async () => {
        //given
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divelog/${diveLog2._id}`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have at least one entry property to modify.');
    }); 

    it('should respond with status 400 if request body is invalid.', async () => {
        //given
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divelog/${diveLog2._id}`).send({
            county: "test country",
            watrBody: "wet water",
            diveype: "test dive"
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have at least one entry property to modify.');
    }); 

    it('should respond with status 200, and the db should contain the modified entry, if a proper request arrives.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.patch(`/api/divelog/${diveLog1._id}`).send({
            duration: 51,
            maxDepth: 21,
            avgDepth: 13,
            site: "Viuda",
            waterTemp: 24,
            weather:"cloudy",
            cylinders: [{
                size: 15,
                startPressure: 210,
                endPressure: 50,
            }],
            gasConsumption: 15
        });
    
        //then
        expect(response.status).toBe(200);
        const diveLog = await DiveLog.findOne();
        expect(response.body.diveLog.userId).toBe("123456");
        expect(response.body.diveLog.duration).toBe(51);
        expect(response.body.diveLog.site).toBe("Viuda");
        expect(response.body.diveLog.maxDepth).toBe(21);
        expect(response.body.diveLog.gasConsumption).toBe(20.460358056265985);
        expect(diveLog.userId).toBe(response.body.diveLog.userId);
        expect(diveLog.duration).toBe(response.body.diveLog.duration);
        expect(diveLog.site).toBe(response.body.diveLog.site);
        expect(diveLog.maxDepth).toBe(response.body.diveLog.maxDepth);
        expect(diveLog.gasConsumption).toBe(response.body.diveLog.gasConsumption);
        expect(diveLog._id.toString()).toBe(response.body.diveLog._id);
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

    afterEach(async () => await clearDb(DiveLog));


    it('should respond with status 403, and the db should have 1 entry after trying to delete without authorization.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        //when
        const response = await client.delete(`/api/divelog/${diveLog1._id}`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
        const diveLog = await DiveLog.findOne();
        expect(diveLog).not.toBe(null);
        expect(diveLog._id.toString()).toBe(diveLog1._id.toString());
    }); 

    it('should respond with status 401, and the db should have 1 entry after trying to delete with invalid authorization.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const token = jwt.sign({userId: "123456"}, 'badSecret');
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divelog/${diveLog1._id}`);
    
        //then
        expect(response.status).toBe(401);
        const diveLog = await DiveLog.findOne();
        expect(diveLog).not.toBe(null);
        expect(diveLog._id.toString()).toBe(diveLog1._id.toString());
    }); 

    it('should respond with status 401, and the db should have 1 entry after trying to delete with an unauthorized userId.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();

        await diveLog1.save();

        const token = jwt.sign({userId: "123457"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divelog/${diveLog1._id}`);
    
        //then
        expect(response.status).toBe(401);
        expect(response.text).toBe('Entry not found or user not authorized to delete.');
        const diveLog = await DiveLog.findOne();
        expect(diveLog).not.toBe(null);
        expect(diveLog._id.toString()).toBe(diveLog1._id.toString());
    }); 

    it('should respond with status 401, and the db should have 1 entry after trying to delete a non-existing entry.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divelog/${diveLog1._id}`);
    
        //then
        expect(response.status).toBe(401);
        expect(response.text).toBe('Entry not found or user not authorized to delete.');
        const diveLog = await DiveLog.findOne();
        expect(diveLog).not.toBe(null);
        expect(diveLog._id.toString()).toBe(diveLog2._id.toString());
    }); 

    it('should respond with status 200, and the db should have 1 entry after deleting the one existing entry.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();
        const diveLog2 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog2.save();

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divelog/${diveLog1._id}`);
    
        //then
        expect(response.status).toBe(200);
        const diveLog = await DiveLog.findOne();
        expect(diveLog).not.toBe(null);
        expect(diveLog._id.toString()).toBe(diveLog2._id.toString());
    }); 

    it('should respond with status 200, and the db should be empty after deleting the only existing entry.', async () => {
        //given
        const diveLog1 = new DiveLog({
            userId: '123456',
            time: Date.now(),
            duration: 50,
            maxDepth: 20,
            avgDepth: 12,
            site: "Las Cambras",
            waterTemp: 23,
            weather:"sunny",
            cylinders: [{
                size: 12,
                startPressure: 200,
                endPressure: 65,
            }],
            gasConsumption: 14.72
        });
        await diveLog1.save();        

        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.delete(`/api/divelog/${diveLog1._id}`);
    
        //then
        expect(response.status).toBe(200);
        const diveLog = await DiveLog.findOne();
        expect(diveLog).toBe(null);
    }); 
});
