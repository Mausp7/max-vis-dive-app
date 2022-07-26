require('dotenv').config();
const app = require('../app')
const mockserver = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
const UserSettings = require('../models/userSettings');
const {startVirtualDb, stopVirtualDb, clearDb} = require('./utils/inMemoryDb');
const jwt = require("jsonwebtoken");
const {setupGoogleSuccessResponse,
    setupGoogleErrorResponse,
    setupGithubSuccessResponse,
    setupGithubErrorResponse,
    setupGithubUserSuccessResponse,
    setupGithubUserErrorResponse
} = require('./utils/httpMock');

describe('/api/user/login POST test', () => {
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

    afterEach(async () => await clearDb(User));

    it('should return 400 without provider data (user not created).', async () => {
        //given
        const code = "random";
        
        //when
        const response = await client.post('/api/user/login').send({
            code
        });
        
        //then
        expect(response.status).toBe(400);
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 400 without code data (user not created).', async () => {
        //given
        const provider = "github";
        
        //when
        const response = await client.post('/api/user/login').send({
            provider
        });
        
        //then
        expect(response.status).toBe(400);
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 400 with invalid provider data (user not created).', async () => {
        //given
        const code = "random";
        const provider = "gitlab";
        
        //when
        const response = await client.post('/api/user/login').send({
            code, provider
        });
        
        //then
        expect(response.status).toBe(400);
        const user = await User.findOne();
        expect(user).toBe(null);
    });
    
    it('should return 200 with JWT with valid google provider (user not created).', async () => {
        //given
        const code = "random";
        const provider = "google";
        const googleUserId = '832475ö4783598142ö5'
        setupGoogleSuccessResponse(googleUserId);

        //when 
        const response = await client.post('/api/user/login').send({
            code, provider
        });
        
        //then
        expect(response.status).toBe(200);
        const responseToken = jwt.decode(response.body)
        expect(responseToken.providers.google).toBe(googleUserId);
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 401 with invalid google code (user not created).', async () => {
        //given
        const code = "random";
        const provider = "google";

        setupGoogleErrorResponse();

        //when 
        const response = await client.post('/api/user/login').send({
            code, provider
        });
        
        //then
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({});
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 200 with JWT with valid github provider (user not created).', async () => {
        //given
        const code = "random";
        const provider = "github";
        const githubAccesCode = '123456789';
        const githubId = '888888';
        setupGithubSuccessResponse(githubAccesCode);
        setupGithubUserSuccessResponse(githubId);

        //when 
        const response = await client.post('/api/user/login').send({
            code, provider
        });
        
        //then
        expect(response.status).toBe(200);
        const responseToken = jwt.decode(response.body)
        expect(responseToken.providers.github).toBe(githubId);
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 401 if access token not recieved with invalid github code (user not created).', async () => {
        //given
        const code = "random";
        const provider = "github";

        setupGithubErrorResponse();

        //when 
        const response = await client.post('/api/user/login').send({
            code, provider
        });
        
        //then
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({});
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 401 if user id not recieved with invalid github access token (user not created).', async () => {
        //given
        const code = "random";
        const provider = "github";
        const githubAccesCode = '123456789'
        setupGithubSuccessResponse(githubAccesCode);
        setupGithubUserErrorResponse();

        //when 
        const response = await client.post('/api/user/login').send({
            code, provider
        });
        
        //then
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({});
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 200 with JWT with valid github provider if user already created (user providers amendend).', async () => {
        //given
        const testUser = await User.create({
            username: "testUser",
            providers: {
                github: "888888"
            }
        })
        const code = "random";
        const provider = "github";
        const githubAccesCode = '123456789';
        const githubId = '888888';

        setupGithubSuccessResponse(githubAccesCode);
        setupGithubUserSuccessResponse(githubId);

        const token = jwt.sign({userId: "123456", providers: {google: "999999"}}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when 
        const response = await client.post('/api/user/login').send({
            code, provider
        });
        
        //then
        expect(response.status).toBe(200);
        const responseToken = jwt.decode(response.body)
        expect(responseToken.username).toBe("testUser");
        expect(responseToken.providers.github).toBe(githubId);
        expect(responseToken.providers.google).toBe("999999");
        expect(responseToken.userId).toBe(testUser._id.toString());

        const user = await User.findOne();
        expect(user).not.toBe(null);
        expect(user.username).toBe(responseToken.username);
        expect(user.providers.github).toBe(responseToken.providers.github);
        expect(user.providers.google).toBe(responseToken.providers.google);
        expect(user._id.toString()).toBe(responseToken.userId);
    });
});


describe('/api/user/create POST test', () => {
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

    afterEach(async () => {
        await clearDb(User);
        await clearDb(UserSettings);
    });

    it('should return 400 without authentication header (user not created).', async () => {
        //given
        
        //when
        const response = await client.post('/api/user/create');
        
        //then
        expect(response.status).toBe(400);
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 401 with invalid authentication header (user not created).', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, 'badSecret');
        client.set('authorization', token);

        //when
        const response = await client.post('/api/user/create');
        
        //then
        expect(response.status).toBe(401);
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 400 without request body (user not created).', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post('/api/user/create');
        
        //then
        expect(response.status).toBe(400);
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 400 without username in request body (user not created).', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post('/api/user/create').send({usrnm: "badkey"});
        
        //then
        expect(response.status).toBe(400);
        const user = await User.findOne();
        expect(user).toBe(null);
    });

    it('should return 200 and jwt token with a proper request (user and userSettings created).', async () => {
        //given
        const token = jwt.sign({userId: "123456", providers: {github: "888888"}}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post('/api/user/create').send({username: "testUser"});
        
        //then
        expect(response.status).toBe(200);
        const userToken = jwt.verify(response.body, process.env.JWT_SECRET);
        expect(userToken.username).toBe("testUser");
        expect(userToken.providers.github).toBe("888888");

        const user = await User.findOne();
        expect(user).not.toBe(null);
        expect(user.username).toBe(userToken.username);
        expect(user.providers).toEqual(userToken.providers);
        expect(userToken.userId).toBe(user._id.toString());

        const userSettings = await UserSettings.findOne();
        expect(userSettings).not.toBe(null);
        expect(userSettings.userId).toBe(user._id.toString());
    });
});