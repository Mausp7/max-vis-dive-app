# Maximum Vis Dive App

## Exam Project

This is a final exam projext, a MERN-stack (full-stack) webapplication.

The Maximum Vis(ibility) app is a recteational-technical dive planner, in which a user can generate no-decompression dive tables or a decompression plan and gas consumption calculation per user input in metric measurements.

As an extension, the user can save past dives in a dive log and save the adjustable gas and conservativism settings in the profile.

## Architecture

- Database tier: MondoDB storing login data and user settings
- Application tier: Node.js web server, running Express.js API, connected to DB
- Display tier: React.js client-side application

## System Requirements

- Node.js v16,
- npm

## Environment variables:

### Create .env file in /backend and define the following variables:

- PORT={4000}
- APP_URL={http://appURL.io}
- CONNECTION_STRING={mongoDBConnectionString}

- JWT_SECRET={jwtTokenSecret}

- LOGFLARE_SCOURCE_ID={logflareId}
- LOGFLARE_API_KEY={logfleareApiKey}

- GOOGLE_CLIENT_ID={googleClientId}
- GOOGLE_CLIENT_SECRET={googleClientSecret}
- GOOGLE_REDIRECT_URI={http://appURL.io/redirect}

## Dev start

### from termnal:

- cd backend
- npm install
- npm start

### from a new terminal:

- cd frontend
- npm install
- npm start

## Dockerization:

### Create .env file in /frontend and define the following variables:

- REACT_APP_URL ={Node-API-host}
- REACT_APP_NODE_API={Node-API-host}/api
- REACT_APP_GOOGLE_AUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
- REACT_APP_GOOGLE_CLIENT_ID={googleClientId}

### from a new terminal:

- cd frontend
- npm run build
- copy /build
- cd ..
- cd backend
- paste /build
- docker build . -t {desired-image-tag}
- mount and run docker image on desiresd host

## API documentation

- start backend Express.js server as described in section "Dev start"
- open localhost:{4000}/docs in browser
- Alternative: /backend/API-docs.yaml

## License

### Commons Clause

Read more about here: https://commonsclause.com
