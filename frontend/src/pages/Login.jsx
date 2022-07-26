import { useAuth } from "../providers/auth";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const Login = () => {
	const { auth } = useAuth();

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				width: "100%",
			}}
		>
			<Button
				variant="contained"
				color="attention"
				size="large"
				style={{
					fontSize: "18px",
				}}
				startIcon={<GoogleIcon />}
				onClick={auth}
			>
				Google Login
			</Button>
		</div>
	);
};

export default Login;
