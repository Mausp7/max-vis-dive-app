import React, { useState } from "react";
import { useAuth } from "../providers/auth";
import { nodeApi } from "../api/nodeApi";
import { TextField, Button, InputAdornment } from "@mui/material";

import DateAdapter from "@mui/lab/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
//import huLocale from "date-fns/locale/hu";
import SaveIcon from "@mui/icons-material/Save";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import message from "../util/message";
import GasName from "./GasName";
import Grid from "@mui/material/Grid";

const EditDiveLog = ({ log, setEdit, diveSites, getDiveLogs }) => {
	const { userSettings } = useAuth();
	const { patch } = nodeApi();

	const [time, setTime] = useState(new Date(log.time));
	const [duration, setDuration] = useState(log.duration);
	const [maxDepth, setMaxDepth] = useState(log.maxDepth);
	const [avgDepth, setAvgDepth] = useState(log.avgDepth);
	const [site, setSite] = useState(log.site);
	const [waterTemp, setWaterTemp] = useState(log.waterTemp);
	const [weather, setWeather] = useState(log.weather);
	const [size, setSize] = useState(log.cylinders[0].size);
	const [gasMixId, setGasMixId] = useState(log.cylinders[0].gasMix._id);
	const [startPressure, setStartPressure] = useState(
		log.cylinders[0].startPressure
	);
	const [endPressure, setEndPressure] = useState(log.cylinders[0].endPressure);

	const updateDiveLogEntry = async () => {
		const response = await patch(`divelog/${log._id}`, {
			time,
			duration,
			maxDepth,
			avgDepth,
			site,
			waterTemp,
			weather,
			cylinders: [
				{
					size,
					startPressure,
					endPressure,
					gasMix: userSettings.gasMixes.filter(
						(gas) => gas._id === gasMixId
					)[0],
				},
			],
		});
		if (response.status === 200) {
			getDiveLogs();
			message("Dive log entry updated.");
			setEdit("");
		}
	};

	return (
		<div>
			<FormControl fullWidth={true}>
				<Grid container spacing={1}>
					<Grid item xs={12}>
						<LocalizationProvider
							dateAdapter={DateAdapter} /* locale={huLocale} */
						>
							<DateTimePicker
								label="Dive time"
								required={true}
								fullWidth={true}
								value={time}
								maxDate={Date.now()}
								onChange={(newValue) => setTime(newValue)}
								renderInput={(params) => (
									<TextField {...params} style={{ width: "100%" }} />
								)}
							/>
						</LocalizationProvider>
					</Grid>
					<Grid item xs={6} xl={6}>
						<TextField
							type="number"
							id="time"
							variant="outlined"
							required={true}
							label="Duration"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">min</InputAdornment>
								),
							}}
							error={duration !== "" && duration < 15}
							helperText="Min. 15 minutes."
							value={duration}
							onChange={(event) => {
								setDuration(event.target.value);
							}}
						/>
					</Grid>
					<Grid item xs={6} xl={6}>
						<TextField
							type="number"
							id="maxDepth"
							required={true}
							variant="outlined"
							label="Max depth"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: <InputAdornment position="end">m</InputAdornment>,
							}}
							error={maxDepth !== "" && maxDepth < 5}
							helperText="Min. 5 meters."
							value={maxDepth}
							onChange={(event) => {
								setMaxDepth(event.target.value);
							}}
						/>
					</Grid>
					<Grid item xs={6} xl={4}>
						<TextField
							select
							fullWidth={true}
							size="small"
							margin="dense"
							label="Dive site"
							value={site}
							onChange={(event) => setSite(event.target.value)}
						>
							{diveSites.map((diveSite, index) => (
								<MenuItem
									value={diveSite._id}
									key={diveSite.name + diveSite.country + index}
								>
									{`${diveSite.name}, ${diveSite.country}`}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid item xs={6} xl={4}>
						<TextField
							select
							fullWidth={true}
							size="small"
							margin="dense"
							label="Weather"
							value={weather}
							onChange={(event) => setWeather(event.target.value)}
						>
							<MenuItem value={"clear"}>clear</MenuItem>
							<MenuItem value={"cloudy"}>cloudy</MenuItem>
							<MenuItem value={"windy"}>windy</MenuItem>
							<MenuItem value={"stormy"}>stormy</MenuItem>
							<MenuItem value={"indoor"}>indoor</MenuItem>
						</TextField>
					</Grid>
					<Grid item xs={6} xl={4}>
						<TextField
							type="number"
							id="waterTemp"
							variant="outlined"
							label="Water temp."
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">°C</InputAdornment>
								),
							}}
							error={waterTemp !== "" && (waterTemp < -3 || waterTemp > 45)}
							helperText="Between -3 and 50 °C"
							value={waterTemp}
							onChange={(event) => {
								setWaterTemp(event.target.value);
							}}
						/>
					</Grid>
					<Grid item xs={6} xl={4}>
						<TextField
							type="number"
							id="Size"
							variant="outlined"
							label="Cylinder"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">liter</InputAdornment>
								),
							}}
							error={size !== "" && (size < 2 || size > 36)}
							helperText="Volume from 2 to 36 liters"
							value={size}
							onChange={(event) => {
								setSize(event.target.value);
							}}
						/>
					</Grid>
					<Grid item xs={6} xl={4}>
						<TextField
							type="number"
							id="startPressure"
							variant="outlined"
							label="Start press."
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">bar</InputAdornment>
								),
							}}
							error={
								startPressure !== "" &&
								(startPressure < 35 || startPressure > 330)
							}
							helperText="Between 35 and 330 bars"
							value={startPressure}
							onChange={(event) => {
								setStartPressure(event.target.value);
							}}
						/>
					</Grid>
					<Grid item xs={6} xl={4}>
						<TextField
							type="number"
							id="endPressure"
							variant="outlined"
							label="End press."
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">bar</InputAdornment>
								),
							}}
							error={
								endPressure !== "" && (endPressure < 0 || endPressure > 330)
							}
							helperText="Between 0 and 330 bars"
							value={endPressure}
							onChange={(event) => {
								setEndPressure(event.target.value);
							}}
						/>
					</Grid>
					<Grid item xs={6}>
						<TextField
							type="number"
							id="avgDepth"
							variant="outlined"
							label="Avg. depth"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: <InputAdornment position="end">m</InputAdornment>,
							}}
							value={avgDepth}
							onChange={(event) => {
								setAvgDepth(event.target.value);
							}}
						/>
					</Grid>

					<Grid item xs={6}>
						<TextField
							select
							label="Breathing gas"
							size="small"
							fullWidth={true}
							style={{ margin: "8px 0px 0px 0px" }}
							helperText={
								userSettings.gasMixes.length === 0
									? "Add breathing gas mixes in settings."
									: ""
							}
							value={gasMixId}
							onChange={(event) => setGasMixId(event.target.value)}
						>
							{userSettings.gasMixes.length === 0 && (
								<MenuItem value={log.cylinders[0].gasMix._id}>
									Add breathing gas mixes in settings.
								</MenuItem>
							)}

							{userSettings.gasMixes.map((gas, index) => (
								<MenuItem value={gas._id} key={index}>
									<GasName gas={gas} />
								</MenuItem>
							))}
						</TextField>
					</Grid>
				</Grid>
			</FormControl>
			<Button
				variant="outlined"
				fullWidth={true}
				color="error"
				endIcon={<DoDisturbIcon />}
				style={{ margin: "15px 0px 10px" }}
				onClick={() => setEdit("")}
			>
				Cancel
			</Button>

			<Button
				variant="contained"
				fullWidth={true}
				endIcon={<SaveIcon />}
				style={{ margin: "0px 0px 5px 0px" }}
				onClick={updateDiveLogEntry}
				disabled={
					duration === "" ||
					maxDepth === "" ||
					avgDepth === "" ||
					site === "" ||
					waterTemp === "" ||
					weather === "" ||
					size === "" ||
					gasMixId === "" ||
					startPressure === "" ||
					endPressure === ""
				}
			>
				Update
			</Button>
		</div>
	);
};

export default EditDiveLog;
