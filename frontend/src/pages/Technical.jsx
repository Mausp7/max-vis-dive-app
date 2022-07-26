import React, { useState } from "react";
import { useAuth } from "../providers/auth";
import { nodeApi } from "../api/nodeApi";
import { TextField, Button, InputAdornment } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import BackspaceIcon from "@mui/icons-material/Backspace";
import DangerousIcon from "@mui/icons-material/Dangerous";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MenuItem from "@mui/material/MenuItem";
import GasName from "../components/GasName";
import Grid from "@mui/material/Grid";

const Technical = () => {
	const { userSettings } = useAuth();
	const { post } = nodeApi();
	const [depth, setDepth] = useState(30);
	const [duration, setDuration] = useState(30);
	const [segments, setSegments] = useState([]);

	const [bottomMix, setBottomMix] = useState(
		userSettings.gasMixes.length !== 0 ? userSettings.gasMixes[0] : ""
	);

	const [cylinderSize, setCylinderSize] = useState(12);

	const [plan, setPlan] = useState(null);
	const [showResults, setShowResults] = useState(false);

	const planDive = async () => {
		const response = await post(`/plan/dive`, {
			dives: segments,
			gases: { bottomMix },
			descentSpeed: userSettings.descentSpeed,
			ascentSpeed: userSettings.ascentSpeed,
			gradFLow: userSettings.gradFLow,
			gradFHigh: userSettings.gradFHigh,
			gasConsumption: userSettings.gasConsumption,
		});
		if (response.status === 200) {
			setPlan(response?.data);
			setShowResults(true);
		}
	};

	return (
		<>
			<div className="main-container">
				<h2>Create your technical dive plan!</h2>
				<Grid container spacing={1}>
					<Grid item xs={6}>
						<TextField
							type="number"
							id="depth"
							variant="outlined"
							label="Max depth"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: <InputAdornment position="end">m</InputAdornment>,
							}}
							error={depth < 6 || depth > 80}
							helperText="Between 6 and 80"
							value={depth}
							onChange={(event) => setDepth(event.target.value)}
						/>
					</Grid>
					<Grid item xs={6}>
						{" "}
						<TextField
							type="number"
							id="duration"
							variant="outlined"
							label="Duration"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">min</InputAdornment>
								),
							}}
							error={duration < 1 || duration > 120}
							helperText="Between 1 and 120"
							value={duration}
							onChange={(event) => setDuration(event.target.value)}
						/>
					</Grid>
					<Grid item xs={12}>
						{" "}
						<Button
							variant="outlined"
							fullWidth={true}
							endIcon={<AddBoxIcon />}
							onClick={() => setSegments([...segments, { depth, duration }])}
							disabled={
								depth < 6 || depth > 80 || duration < 1 || duration > 120
							}
						>
							Add dive segment
						</Button>
					</Grid>
					<Grid item xs={6}>
						<TextField
							select
							label="Bottom Mix"
							fullWidth={true}
							size="small"
							margin="dense"
							helperText={
								userSettings.gasMixes.length === 0
									? "Add breathing gas mixes in settings."
									: ""
							}
							value={bottomMix}
							onChange={(event) => setBottomMix(event.target.value)}
						>
							{userSettings.gasMixes.length === 0 && (
								<MenuItem value="">
									Add breathing gas mixes in settings.
								</MenuItem>
							)}
							{userSettings.gasMixes.map((gas, index) => (
								<MenuItem value={gas} key={index}>
									<GasName gas={gas} />
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid item xs={6}>
						<TextField
							type="number"
							id="cylinderSize"
							variant="outlined"
							label="Cylinder size"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">liter</InputAdornment>
								),
							}}
							error={cylinderSize < 1 || cylinderSize > 36}
							helperText={
								cylinderSize < 1 || cylinderSize > 36 ? "Between 1 and 120" : ""
							}
							value={cylinderSize}
							onChange={(event) => setCylinderSize(event.target.value)}
						/>
					</Grid>
				</Grid>
				{segments.length !== 0 && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							alignItems: "center",
							margin: "20px 0px",
						}}
					>
						{segments.map((s, index) => (
							<div
								key={index}
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									width: "100%",
									margin: "0px 0px 0px 25px",
								}}
							>
								<p style={{ fontSize: "16px" }}>{`Segment ${index + 1}`}</p>
								<p style={{ fontSize: "16px" }}>{`depth: ${s.depth} m`}</p>
								<p style={{ fontSize: "16px" }}>{`time: ${s.duration} min`}</p>

								<Button
									size="small"
									startIcon={<BackspaceIcon />}
									onClick={() =>
										setSegments(segments.filter((s, i) => i !== index))
									}
								></Button>
							</div>
						))}
					</div>
				)}
				<Grid container spacing={1} style={{ marginTop: "10px" }}>
					<Grid item xs={12}>
						<Button
							variant="contained"
							fullWidth={true}
							onClick={planDive}
							disabled={!segments[0] || bottomMix === ""}
						>
							Make a plan
						</Button>
					</Grid>
					<Grid item xs={12}>
						<Button
							variant="outlined"
							fullWidth={true}
							color="error"
							endIcon={<DeleteForeverIcon />}
							disabled={segments.length === 0}
							onClick={() => setSegments([])}
						>
							Clear segments
						</Button>
					</Grid>
				</Grid>
			</div>
			{showResults && (
				<div className="secondary-container">
					<h3
						style={{
							margin: "0px 0px 10px",
						}}
					>
						Dive segments:
					</h3>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{plan.dives?.map((s, index) => (
							<Grid
								container
								key={index}
								spacing={1}
								collumns={12}
								style={{
									padding: "10px 0px",
									borderBottom: "1px solid rgba(218, 237, 251, 1)",
								}}
							>
								<Grid item xs={4}>
									<p
										style={{
											fontSize: "16px",
											fontWeight: "bold",
											textAlign: "left",
										}}
									>{`Segment: ${index + 1}:`}</p>
								</Grid>

								<Grid item xs={4}>
									<p
										style={{ fontSize: "16px", textAlign: "center" }}
									>{`depth: ${s.depth} m`}</p>
								</Grid>
								<Grid item xs={4}>
									<p
										style={{ fontSize: "16px", textAlign: "right" }}
									>{`time: ${s.duration} min`}</p>
								</Grid>
								<Grid item xs={4}>
									<p
										style={{ fontSize: "16px", textAlign: "left" }}
									>{`ceiling: ${s.ceiling} m`}</p>
								</Grid>
								<Grid item xs={8}>
									<p style={{ fontSize: "16px", textAlign: "right" }}>
										gas: <GasName gas={s.gas} />, {s.gasConsumption} l
									</p>
								</Grid>
								{s.alert && (
									<Grid item xs={12}>
										<p
											style={{
												fontSize: "16px",
												fontWeight: "500",
												textAlign: "center",
												color: "rgba(212, 66, 53, 1)",
											}}
										>
											Alert! PPO2: {((s.depth / 10 + 1) * s.gas.o2).toFixed(2)}
											{", "}
											{<GasName gas={s.gas} />} MOD: {s.alert?.mod} m
										</p>
									</Grid>
								)}
							</Grid>
						))}
					</div>
					<h3
						style={{
							margin: "20px 0px 15px",
						}}
					>
						Decompression plan:
					</h3>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							margin: "0px 0px 20px",
						}}
					>
						{plan.decoPlan?.length === 0 && (
							<p>No staged decompression necessary.</p>
						)}
						{plan.decoPlan?.map((s, index) => (
							<div
								key={index}
								style={{
									width: "180px",
								}}
							>
								<Grid container>
									<Grid item xs={4}>
										{s.action === "stop" ? (
											<DangerousIcon style={{ fontSize: "20px" }} />
										) : (
											<NorthEastIcon style={{ fontSize: "20px" }} />
										)}
									</Grid>
									<Grid item xs={4}>
										<p>{`${s.depth} m`}</p>
									</Grid>
									<Grid item xs={4} style={{ textAlign: "right" }}>
										<p>{`${s.duration} min`}</p>
									</Grid>
								</Grid>
							</div>
						))}
						{plan.decoPlan?.length !== 0 && (
							<p style={{ alignSelf: "flex-end", margin: "10px 0px" }}>
								Deco gas required:{" "}
								{plan.decoPlan?.reduce(
									(total, s) => total + Number(s.gasConsumption),
									0
								)}{" "}
								l
							</p>
						)}
					</div>
					<div>
						<h3 style={{ alignSelf: "flex-end", margin: "10px 0px" }}>
							Total gas used:{" "}
							{Math.ceil(
								plan.decoPlan?.reduce(
									(total, deco) => total + Number(deco.gasConsumption),
									0
								) +
									plan.dives?.reduce(
										(total, dive) => total + Number(dive.gasConsumption),
										0
									)
							)}{" "}
							l (
							{Math.ceil(
								(plan.decoPlan?.reduce(
									(total, deco) => total + Number(deco.gasConsumption),
									0
								) +
									plan.dives?.reduce(
										(total, dive) => total + Number(dive.gasConsumption),
										0
									)) /
									cylinderSize
							)}{" "}
							bar)
						</h3>
					</div>
					<Button
						variant="outlined"
						color="secondary"
						onClick={() => setShowResults(false)}
					>
						Close
					</Button>
				</div>
			)}
		</>
	);
};

export default Technical;
