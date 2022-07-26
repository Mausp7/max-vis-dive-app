import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/auth";
import { TextField, Button } from "@mui/material";

const Register = () => {
	const [username, setUsername] = useState("");
	const { register, user } = useAuth();

	const navigate = useNavigate();

	useEffect(() => {
		if (user.userId) navigate("/");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	return (
		<div
			className="main-container"
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				padding: "30px",
			}}
		>
			<h4>How would you tag your dive gear?</h4>
			<TextField
				variant="outlined"
				label="Username"
				size="small"
				color="primary"
				style={{
					margin: "20px 0",
				}}
				value={username}
				onChange={(event) => setUsername(event.target.value)}
			/>
			<Button
				variant="contained"
				color="primary"
				onClick={() => register(username)}
			>
				Save
			</Button>
		</div>
	);
};

export default Register;
