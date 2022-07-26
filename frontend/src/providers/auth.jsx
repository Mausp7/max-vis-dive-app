import { useState, useEffect, useContext, createContext } from "react";
// import axios from "axios";
import jwt from "jwt-decode";
import { nodeApi } from "../api/nodeApi";
import config from "../app.config";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);
	const [userSettings, setUserSettings] = useState({});
	const { get, post } = nodeApi();

	useEffect(() => {
		const tokenFromStorage = localStorage.getItem("tokenJWT");
		const now = Date.now();
		if (tokenFromStorage && jwt(tokenFromStorage).exp * 1000 - now > 0)
			return setToken(tokenFromStorage);
		localStorage.removeItem("tokenJWT");
	}, []);

	useEffect(() => {
		try {
			setUser(jwt(token));
		} catch {
			setUser(null);
		}
	}, [token]);

	const getUserSettings = async () => {
		const response = await get("/settings");
		if (response.status === 200)
			return setUserSettings(response.data.userSettings);
		setToken(null);
		localStorage.removeItem("tokenJWT");
	};

	useEffect(() => {
		if (user?.userId) getUserSettings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const auth = () => {
		const googleAuthUrl = config.googleAuthUrl;
		const searchParams = new URLSearchParams();
		searchParams.append("client_id", config.googleClientId);
		searchParams.append("scope", "openid");
		searchParams.append("response_type", "code");
		searchParams.append("redirect_uri", `${config.appUrl}/redirect`);
		searchParams.append("promt", "select_account");
		const fullUrl = `${googleAuthUrl}?${searchParams}`;
		//window.location.href = fullUrl;
		window.open(fullUrl, "_self");
	};

	const login = async (code, provider) => {
		try {
			const response = await post(`/user/login`, {
				code,
				provider,
			});
			setToken(response.data);
			localStorage.setItem("tokenJWT", response.data);
			setUser(jwt(response.data));
		} catch (error) {
			setToken(null);
			localStorage.removeItem("tokenJWT");
		}
	};

	const register = async (username) => {
		const response = await post("/user/create", {
			username,
		});

		if (response?.status === 200) {
			setToken(response.data);
			localStorage.setItem("tokenJWT", response.data);
			setUser(jwt(response.data));
		}
	};

	const logout = () => {
		setToken(null);
		localStorage.removeItem("tokenJWT");
	};

	const contextValue = {
		token,
		user,
		userSettings,
		setUserSettings,
		auth,
		login,
		logout,
		register,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};

const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("Add AuthProvider to root.");
	return useContext(AuthContext);
};

export { AuthProvider, useAuth };
