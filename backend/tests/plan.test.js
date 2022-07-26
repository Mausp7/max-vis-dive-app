require('dotenv').config();
const app = require('../app')
const mockserver = require('supertest');
const jwt = require("jsonwebtoken");
const { GasMix } = require('../logic/decompression')

describe('/api/plan/table POST tests', () => {
    let connection;
    let mongodb;
    let client;

    beforeAll(async () => {
        client = mockserver.agent(app);
    });


    it('should respond with status 400 if request body is missing.', async () => {
        //given

        //when
        const response = await client.post(`/api/plan/table`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have depth, gasO2, gradientFactor.');
    });

    it('should respond with status 400 if request body is invalid.', async () => {
        //given

        //when
        const response = await client.post(`/api/plan/table`).send({
            steps: 3,
            gas: 0.21,
            gradientFactor: 1
        });;
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have depth, gasO2, gradientFactor.');
    });

    it('should respond with status 400 if req.body.gas is not of class Gas.', async () => {
        //given

        //when
        const response = await client.post(`/api/plan/table`).send({
            maxDepth: 40,
            steps: 3,
            gas:0.21,
            gradientFactor: 1
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have gas of class Gas.');
    }); 

    it('should respond with status 200 and a dive table, if a proper request arrives.', async () => {
        //given

        //when
        const response = await client.post(`/api/plan/table`).send({
            maxDepth: 40,
            steps: 3,
            gas: new GasMix(0.21),
            gradientFactor: 1
        });
    
        //then
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("table");
        expect(response.body.table[0]).toHaveProperty("depth", 6);
        expect(response.body.table[0]).toHaveProperty("limit", null);
        expect(response.body).toHaveProperty("mod", 56.6);
    }); 

    it('should respond with status 200 and a dive table until the gas MOD, if a proper request arrives.', async () => {
        //given

        //when
        const response = await client.post(`/api/plan/table`).send({
            maxDepth: 40,
            steps: 3,
            gas: new GasMix(0.32),
            gradientFactor: 1
        });
    
        //then
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("table");
        expect(response.body.table[0]).toHaveProperty("depth", 6);
        expect(response.body.table[0]).toHaveProperty("limit", null);
        expect(response.body.table[9]).toHaveProperty("depth", 33);
        expect(response.body.table[9]).toHaveProperty("limit", 19);
        expect(response.body).toHaveProperty("mod", 33.7);
    }); 
});


describe('/api/plan/dive POST tests', () => {
    let connection;
    let mongodb;
    let client;
    beforeAll(async () => {
        client = mockserver.agent(app);
    });
    

    it('should respond with status 401 if authorization header is missing.', async () => {
        //given

        //when
        const response = await client.post(`/api/plan/dive`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe("Authorization header required.");
    }); 

    it('should respond with status 400 if request body is invalid.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/plan/dive`).send({
            country: "test country",
            waterBody: "wet water",
            diveType: "test dive"
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have dives, gases, descentSpeed, ascentSpeed.');
    }); 

    it('should respond with status 400 if request body is missing.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/plan/dive`);
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have dives, gases, descentSpeed, ascentSpeed.');
    }); 

    it('should respond with status 400 if request body is invalid.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/plan/dive`).send({
            gases: {
                bottomMix : new GasMix(0.21),
            },
            descentSpeed: 18,
            ascentSpeed: 9
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have dives, gases, descentSpeed, ascentSpeed.');
    }); 

    it("should respond with status 400 if req.body.gases.bottomMix is not of class Gas.", async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/plan/dive`).send({
            dives : [
                {
                    depth: 40, 
                    duration: 30
                }, {
                    depth: 20, 
                    duration: 5
                }
            ],
            gases: {
                bottomMix : 0.21,
            },
            descentSpeed: 18,
            ascentSpeed: 9
        });
    
        //then
        expect(response.status).toBe(400);
        expect(response.text).toBe('Request body must have gasses with values of class Gas.');
    });

    it('should respond with status 200 and a dive plan, if a proper request arrives.', async () => {
        //given
        const token = jwt.sign({userId: "123456"}, process.env.JWT_SECRET);
        client.set('authorization', token);

        //when
        const response = await client.post(`/api/plan/dive`).send({
            dives : [
                {
                    depth: 40, 
                    duration: 30
                }, {
                    depth: 20, 
                    duration: 5
                }
            ],
            gases: {
                bottomMix : new GasMix(0.21),
            },
            descentSpeed: 18,
            ascentSpeed: 9
        });
    
        //then
        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty("dives");
        expect(response.body.dives[0]).toHaveProperty("depth", 40);
        expect(response.body.dives[0]).toHaveProperty("duration", 30);
        expect(response.body.dives[0]).toHaveProperty("ceiling", 4.8);
        
        expect(response.body).toHaveProperty("decoPlan");
        expect(response.body.decoPlan[response.body.decoPlan.length - 1]).toHaveProperty("action", "ascent");
        expect(response.body.decoPlan[response.body.decoPlan.length - 1]).toHaveProperty("depth", 0);
        expect(response.body.decoPlan[response.body.decoPlan.length - 1]).toHaveProperty("duration", 1);
    }); 
});
