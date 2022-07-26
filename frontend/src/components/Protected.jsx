import { useAuth } from "../providers/auth";
import { Navigate, useLocation } from "react-router";

const Protected = ({ children }) => {
	const { token, user } = useAuth();
	const location = useLocation();
	const tokenFromStorage = localStorage.getItem("tokenJWT");

	return (
		<>
			{!tokenFromStorage ? (
				<Navigate to={"/login"} />
			) : !token ? (
				<Navigate to={"/"} />
			) : !user.userId && location.pathname !== "/register" ? (
				<Navigate to={"/register"} />
			) : (
				children
			)}
		</>
	);
};

export default Protected;
