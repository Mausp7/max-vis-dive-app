const {_instance} = require('../../utils/http');
const axiosMockAdapter = require("axios-mock-adapter");
const jwt = require('jsonwebtoken');
const mock = new axiosMockAdapter(_instance);

const setupGoogleSuccessResponse = (sub) => {
    const token = jwt.sign({sub}, 'secret');

    mock
    .onPost("https://oauth2.googleapis.com/token")
    .replyOnce(200, {id_token: token});
};

const setupGoogleErrorResponse = () => {
    mock
    .onPost("https://oauth2.googleapis.com/token")
    .replyOnce(401);
};

const setupGithubSuccessResponse = (access_token) => {
    const token = jwt.sign({access_token}, 'secret');

    mock
    .onPost("https://github.com/login/oauth/access_token")
    .replyOnce(200, {access_token});
};

const setupGithubErrorResponse = () => {
    mock
    .onPost("https://github.com/login/oauth/access_token")
    .replyOnce(401);
};

const setupGithubUserSuccessResponse = (userId) => {
    mock
    .onGet("https://api.github.com/user")
    .replyOnce(200, {id: userId});
};

const setupGithubUserErrorResponse = () => {
    mock
    .onGet("https://api.github.com/user")
    .replyOnce(401);
};

module.exports = {
    setupGoogleSuccessResponse,
    setupGoogleErrorResponse,
    setupGithubSuccessResponse,
    setupGithubErrorResponse,
    setupGithubUserSuccessResponse,
    setupGithubUserErrorResponse
}