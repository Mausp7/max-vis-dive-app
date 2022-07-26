import React, { useState } from "react";
import { useAuth } from "../providers/auth";
import { Button } from "@mui/material";
import BasicSettings from "../components/BasicSettings";
import GasMixer from "../components/GasMixer";
import Tissues from "../components/Tissues";

const Settings = () => {
	const { user } = useAuth();

	const [display, setDisplay] = useState("basic");

	return (
		<div className="main-container">
			<h2>{`${user?.username}'s Settings`}</h2>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					margin: "0px 0px 15px",
				}}
			>
				<Button
					variant={display === "basic" ? "outlined" : ""}
					color={display === "basic" ? "attention" : "primary"}
					onClick={() => setDisplay("basic")}
				>
					Basic settings
				</Button>
				<Button
					variant={display === "mixer" ? "outlined" : ""}
					color={display === "mixer" ? "attention" : "primary"}
					onClick={() => setDisplay("mixer")}
				>
					Gas Mixer
				</Button>
				<Button
					variant={display === "tissues" ? "outlined" : ""}
					color={display === "tissues" ? "attention" : "primary"}
					onClick={() => setDisplay("tissues")}
				>
					Tissue Settings
				</Button>
			</div>

			{display === "basic" && <BasicSettings />}
			{display === "mixer" && <GasMixer />}
			{display === "tissues" && <Tissues />}
		</div>
	);
};

export default Settings;
