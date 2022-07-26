import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/auth";
import Spinner from "../util/Spinner";

const Redirect = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const getToken = async () => {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			if (code) {
				await login(code, "google");
			}
			navigate("/");
		};

		getToken();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <Spinner />;
};

export default Redirect;
