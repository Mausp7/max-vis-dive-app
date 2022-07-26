import React, { useState } from "react";
import { useAuth } from "../providers/auth";
import { nodeApi } from "../api/nodeApi";
import { TextField, Button, InputAdornment } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FormControl from "@mui/material/FormControl";
import message from "../util/message";
import Grid from "@mui/material/Grid";

const BasicSettings = () => {
	const { userSettings, setUserSettings } = useAuth();
	const { patch } = nodeApi();

	const [descentSpeed, setDescentSpeed] = useState(userSettings.descentSpeed);
	const [ascentSpeed, setAscentSpeed] = useState(userSettings.ascentSpeed);
	const [diveConsumption, setDiveConsumption] = useState(
		userSettings.gasConsumption.dive
	);
	const [decoConsumption, setDecoConsumption] = useState(
		userSettings.gasConsumption.deco
	);

	const [gradFLow, setGradFLow] = useState(userSettings.gradFLow);
	const [gradFHigh, setGradFHigh] = useState(userSettings.gradFHigh);

	const saveSetting = async () => {
		const response = await patch(`/settings/`, {
			descentSpeed,
			ascentSpeed,
			gasConsumption: { dive: diveConsumption, deco: decoConsumption },
			gradFLow,
			gradFHigh,
		});
		if (response.status === 200) {
			setUserSettings(response.data.userSettings);
			message("Settings saved.");
		}
	};

	return (
		<FormControl fullWidth={true} style={{}}>
			<Grid container spacing={1}>
				<Grid item xs={12} lg={6}>
					<TextField
						type="number"
						id="descentSpeed"
						variant="outlined"
						label="Descent speed"
						fullWidth={true}
						margin="dense"
						size="small"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">m/min</InputAdornment>
							),
						}}
						error={descentSpeed < 1 || descentSpeed > 50}
						helperText={
							descentSpeed < 1 || descentSpeed > 50 ? "From 1 to 50" : ""
						}
						value={descentSpeed}
						onChange={(event) => setDescentSpeed(event.target.value)}
					/>
				</Grid>
				<Grid item xs={12} lg={6}>
					<TextField
						type="number"
						id="ascentSpeed"
						variant="outlined"
						label="Ascent speed"
						fullWidth={true}
						margin="dense"
						size="small"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">m/min</InputAdornment>
							),
						}}
						error={ascentSpeed < 1 || ascentSpeed > 20}
						helperText={
							ascentSpeed < 1 || ascentSpeed > 20 ? "From 1 to 20" : ""
						}
						value={ascentSpeed}
						onChange={(event) => setAscentSpeed(event.target.value)}
					/>
				</Grid>
				<Grid item xs={12} lg={6}>
					<TextField
						type="number"
						id="diveConsumption"
						variant="outlined"
						label="SAC rate diving"
						fullWidth={true}
						margin="dense"
						size="small"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">l/min</InputAdornment>
							),
						}}
						error={diveConsumption < 10 || diveConsumption > 60}
						helperText={
							diveConsumption < 1 || diveConsumption > 60 ? "From 10 to 60" : ""
						}
						value={diveConsumption}
						onChange={(event) => setDiveConsumption(event.target.value)}
					/>
				</Grid>
				<Grid item xs={12} lg={6}>
					<TextField
						type="number"
						id="decoConsumption"
						variant="outlined"
						label="SAC rate deco"
						fullWidth={true}
						margin="dense"
						size="small"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">l/min</InputAdornment>
							),
						}}
						error={decoConsumption < 10 || decoConsumption > 40}
						helperText={
							decoConsumption < 1 || decoConsumption > 40 ? "From 10 to 40" : ""
						}
						value={decoConsumption}
						onChange={(event) => setDecoConsumption(event.target.value)}
					/>
				</Grid>
				<Grid item xs={12} lg={6}>
					<TextField
						type="number"
						id="gradFLow"
						variant="outlined"
						label="Gradient factor - low"
						fullWidth={true}
						margin="dense"
						size="small"
						InputProps={{
							endAdornment: <InputAdornment position="end">%</InputAdornment>,
						}}
						error={gradFLow < 0.01 || gradFLow > 1}
						helperText={gradFLow < 0.01 || gradFLow > 1 ? "From 1 to 100" : ""}
						value={gradFLow * 100}
						onChange={(event) => setGradFLow(event.target.value / 100)}
					/>
				</Grid>
				<Grid item xs={12} lg={6}>
					<TextField
						type="number"
						id="gradFHigh"
						variant="outlined"
						label="Gradient factor - high"
						fullWidth={true}
						margin="dense"
						size="small"
						InputProps={{
							endAdornment: <InputAdornment position="end">%</InputAdornment>,
						}}
						error={gradFHigh < 0.01 || gradFHigh > 1}
						helperText={
							gradFHigh < 0.01 || gradFHigh > 1
								? "Number between 1 and 100"
								: ""
						}
						value={gradFHigh * 100}
						onChange={(event) => setGradFHigh(event.target.value / 100)}
					/>
				</Grid>
			</Grid>

			<Button
				variant="contained"
				endIcon={<SaveIcon />}
				onClick={() => saveSetting()}
				style={{
					margin: "10px 0px 0px",
				}}
				disabled={
					descentSpeed < 1 ||
					descentSpeed > 50 ||
					ascentSpeed < 1 ||
					ascentSpeed > 20 ||
					gradFLow < 0.01 ||
					gradFLow > 1 ||
					gradFHigh < 0.01 ||
					gradFHigh > 1
				}
			>
				Save
			</Button>
		</FormControl>
	);
};

export default BasicSettings;
