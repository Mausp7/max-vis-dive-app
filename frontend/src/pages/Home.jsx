import React from "react";
import { useAuth } from "../providers/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const Home = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	return (
		<>
			<div
				className="main-container"
				style={{ display: "flex", padding: "40px 30px" }}
			>
				<h2>
					Welcome to the Max Vis Dive App
					{user ? `, ${user.username}` : ""}!
				</h2>
				<p>
					Max Vis is a recreational-technical dive planner, where you can
					generate no-decompression dive tables or decompression plans and gas
					consumption calculations after signup. Data needs to be entered in
					metric measurements.
				</p>
				<p>
					As an extension, it is possible to save past dives in a dive log and
					store breathing gas mixtures and conservativism settings in the user
					profile.
				</p>
				<p>
					The decompression model and algorythm is a strictly experimental one.
					It is based on the openly availible data of the ZHL decompression
					models, and it provides comparable plans, but it has not been tested
					and peer reviewed.
				</p>
				<h3>This is a private project for demonstration purposes only. </h3>
				<h3 className="warning">
					<strong>
						Do NOT use any of the generated tables or plans for actual dives.
					</strong>
				</h3>
				<h3>
					Accidents happen, and the creator does not take any resposibility for
					dives made using this app.
				</h3>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					width: "55vW",
				}}
			>
				<Button
					variant="contained"
					size="large"
					color="primary"
					style={{
						margin: "20px 0px",
						boxShadow: "3px 3px 7px 3px rgba(0, 0, 0, 0.7)",
						fontSize: "18px",
					}}
					onClick={() => navigate("/technical")}
				>
					Try the Tec Dive Planner
				</Button>
			</div>
		</>
	);
};

export default Home;
