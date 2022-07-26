import axios from 'axios';
import config from "../app.config";
import message from "../util/message";

export const nodeApi = () => { 
    const instance = axios.create({
        baseURL: config.REACT_APP_NODE_API,
        timeout: 3000,
    });

    const get = async (path) => {
        try {
            const response = await instance.get(path, {
                headers: {
                    authorization: localStorage.getItem("tokenJWT")
                }
            });
            return response;
        } catch (error) {
            if (!error.response) return error;
            message(error.response.data.message ? error.response.data.message : error.response.data);
            return error.response;
        };
    };

    const post = async (path, data) => {
        try {
            const response = await instance.post(path, data, {
                headers: {
                    authorization: localStorage.getItem("tokenJWT")
                }
            });
            return response;
        } catch (error) {
            if (!error.response) return error;
            message(error.response.data.message ? error.response.data.message : error.response.data);
            return error.response;
        };
    };

    const patch = async (path, data) => {
        try {
            const response = await instance.patch(path, data, {
                headers: {
                    authorization: localStorage.getItem("tokenJWT")
                }
            });
            return response;
        } catch (error) {
            if (!error.response) return error;
            message(error.response.data.message ? error.response.data.message : error.response.data);
            return error.response;
        };
    };

    const del = async (path) => {
        try {
            const response = await instance.delete(path, {
                headers: {
                    authorization: localStorage.getItem("tokenJWT")
                }
            });
            return response;
        } catch (error) {
            if (!error.response) return error;
            message(error.response.data.message ? error.response.data.message : error.response.data);
            return error.response;
        };
    };


    return {get, post, patch, del, _isntance: instance};
};
