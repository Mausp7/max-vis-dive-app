import React, { useState } from "react";
import { useAuth } from "../providers/auth";
import { nodeApi } from "../api/nodeApi";
import { TextField, Button, InputAdornment } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import GasName from "./GasName";
import message from "../util/message";

const Settings = () => {
	const { userSettings, setUserSettings } = useAuth();
	const { post, del } = nodeApi();

	const [o2, setO2] = useState(21);
	const [deleteGasMix, setDeleteGasMix] = useState("");

	const saveGasMix = async () => {
		const response = await post(`/settings/gasmix`, {
			o2: o2 / 100,
		});
		if (response.status === 200) {
			setUserSettings(response.data.userSettings);
			message("Gas mix saved.");
		}
	};

	const eraseGasMix = async () => {
		const response = await del(`/settings/gasmix/${deleteGasMix.o2}`);
		if (response.status === 200) {
			setUserSettings(response.data.userSettings);
			message("Gas mix deleted.");
		}
	};

	return (
		<FormControl fullWidth={true} style={{}}>
			<TextField
				type="number"
				id="o2"
				variant="outlined"
				label="Breathing gas O2%"
				fullWidth={true}
				margin="dense"
				InputProps={{
					endAdornment: <InputAdornment position="end">%</InputAdornment>,
				}}
				error={o2 < 18 || o2 > 100}
				helperText="Between 18 and 100"
				value={o2}
				onChange={(event) => {
					setO2(event.target.value);
				}}
			/>
			<Button
				variant="contained"
				fullWidth={true}
				endIcon={<SaveIcon />}
				onClick={saveGasMix}
				disabled={o2 < 18 || o2 > 100}
			>
				Save
			</Button>
			<TextField
				select
				fullWidth={true}
				margin="dense"
				id="deleteMixSelector"
				label="Gas mix to delete"
				color="error"
				value={deleteGasMix}
				onChange={(event) => setDeleteGasMix(event.target.value)}
			>
				{userSettings.gasMixes.map((gas, index) => (
					<MenuItem value={gas} key={index}>
						<GasName gas={gas}></GasName>
					</MenuItem>
				))}
			</TextField>
			<Button
				variant="contained"
				fullWidth={true}
				endIcon={<DeleteForeverIcon />}
				color="error"
				onClick={eraseGasMix}
				disabled={deleteGasMix === ""}
			>
				Delete
			</Button>
		</FormControl>
	);
};

export default Settings;
