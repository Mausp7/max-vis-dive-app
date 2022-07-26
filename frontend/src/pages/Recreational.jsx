import React, { useState } from "react";
import { nodeApi } from "../api/nodeApi";
import GasMix from "../logic/GasMix";
import GasName from "../components/GasName";
import { TextField, Button, InputAdornment } from "@mui/material";
import Slider from "@mui/material/Slider";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";

const Recreational = () => {
	const { post } = nodeApi();
	const [maxDepth, setMaxDepth] = useState(40);
	const [steps, setSteps] = useState(3);
	const [o2, setO2] = useState(21);
	const [safetyMargin, setSafetyMargin] = useState(0);
	const [plan, setPlan] = useState({});
	const [showResults, setShowResults] = useState(false);

	const planDive = async () => {
		const response = await post(`/plan/table`, {
			maxDepth,
			steps,
			gas: new GasMix(o2 / 100),
			gradientFactor: (100 - safetyMargin) / 100,
		});
		if (response.status === 200) {
			setPlan(response?.data);
			setShowResults(true);
		}
	};

	return (
		<>
			<div className="main-container">
				<h2>Create your recreational dive table!</h2>
				<Grid container spacing={1}>
					<Grid item xs={12} md={6}>
						<TextField
							type="number"
							id="maxDepth"
							variant="outlined"
							label="Max depth"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: <InputAdornment position="end">m</InputAdornment>,
							}}
							error={maxDepth < 6 || maxDepth > 40}
							helperText="Between 6 and 40"
							value={maxDepth}
							onChange={(event) => setMaxDepth(event.target.value)}
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<TextField
							type="number"
							id="steps"
							variant="outlined"
							label="Increment"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: <InputAdornment position="end">m</InputAdornment>,
							}}
							error={steps < 1 || steps > 5}
							helperText="Between 1 and 5"
							value={steps}
							onChange={(event) => setSteps(event.target.value)}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<TextField
							type="number"
							id="o2"
							variant="outlined"
							label="Gas mix O2"
							fullWidth={true}
							size="small"
							margin="dense"
							InputProps={{
								endAdornment: <InputAdornment position="end">%</InputAdornment>,
							}}
							error={o2 < 21 || o2 > 40}
							helperText="Between 21 and 40"
							value={o2}
							onChange={(event) => setO2(event.target.value)}
						/>
					</Grid>

					<Grid item xs={12} md={6} style={{ transform: "scale(0.92)" }}>
						<InputLabel htmlFor="safetyMargin">Safety factor</InputLabel>
						<Slider
							id="safetyMargin"
							value={safetyMargin * 5}
							onChange={(event) => setSafetyMargin(event.target.value / 5)}
							valueLabelFormat={(value) => `${value / 5}%`}
							getAriaValueText={(value) => `${value / 5}%`}
							step={null}
							valueLabelDisplay="auto"
							marks={[
								{
									value: 0,
									label: "0%",
								},
								{
									value: 25,
									label: "5%",
								},
								{
									value: 50,
									label: "10%",
								},
								{
									value: 75,
									label: "15%",
								},
								{
									value: 100,
									label: "20%",
								},
							]}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button
							variant="contained"
							fullWidth={true}
							style={{ marginTop: "15px" }}
							onClick={planDive}
							disabled={
								maxDepth < 6 ||
								maxDepth > 40 ||
								steps < 1 ||
								steps > 5 ||
								o2 < 21 ||
								o2 > 40
							}
						>
							Create Dive Table
						</Button>
					</Grid>
				</Grid>
			</div>
			{showResults && (
				<div className="secondary-container">
					<h2
						style={{
							margin: "10px 10px 5px",
						}}
					>
						Dive Table
					</h2>
					<h3
						style={{
							margin: "5px 10px",
						}}
					>
						breathing gas: <GasName gas={{ o2: o2 / 100, he2: 0 }}></GasName>
					</h3>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							margin: "10px 10px 10px",
						}}
					>
						<p style={{ marginLeft: "50px" }}>Depth:</p>
						<p style={{ marginRight: "40px" }}>Bottom limit:</p>
					</div>

					{plan.table?.map((s) => (
						<div
							key={s.depth}
							style={{
								display: "flex",
								justifyContent: "space-between",
								margin: "5px 60px",
							}}
						>
							<p>{`${s.depth} m:`}</p>
							<p>{s.limit ? `${s.limit} min` : "no limit"}</p>
						</div>
					))}
					{plan.mod && (
						<p
							style={{
								margin: "20px 40px",
								fontWeight: "500",
								textAlign: "right",
							}}
						>
							Breathing gas MOD: {plan.mod} m
						</p>
					)}
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

export default Recreational;
