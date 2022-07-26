import React, { useState } from "react";
import { useAuth } from "../providers/auth";
import { nodeApi } from "../api/nodeApi";
import { TextField, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import originalTissueSettings from "../logic/tissueSettings";
import Grid from "@mui/material/Grid";

const Settings = () => {
	const { userSettings, setUserSettings } = useAuth();
	const { patch } = nodeApi();

	const [tissues, setTissues] = useState(userSettings.tissues);

	const saveTissues = async () => {
		const invalidTissues = tissues.filter(
			(tissue) => tissue.mValue < 1 || tissue.mValue > 5
		);
		if (invalidTissues.length !== 0)
			return console.log("Some tissues out of range.");

		const response = await patch(`/settings/`, {
			tissues,
		});
		if (response.status === 200) setUserSettings(response.data.userSettings);
	};

	return (
		<>
			<FormControl
				fullWidth={true}
				style={{
					margin: "20px 0",
				}}
			>
				<Grid container spacing={1}>
					{tissues.map((tissue, index) => (
						<Grid key={tissue.halfTime} item xs={6}>
							<TextField
								id={`${tissue.halfTime}`}
								type="number"
								variant="outlined"
								fullWidth={true}
								style={{ width: "100%" }}
								margin="dense"
								size="small"
								label={`${tissue.halfTime} min tissue`}
								error={tissue.mValue < 1 || tissue.mValue > 5}
								helperText={
									tissue.mValue < 1 || tissue.mValue > 5
										? "M-value must be between 1 and 5."
										: ""
								}
								value={tissue.mValue}
								onChange={(event) => {
									const newTissues = [...tissues];
									newTissues[index].mValue = Number(event.target.value);
									setTissues(newTissues);
								}}
							/>
						</Grid>
					))}
				</Grid>
			</FormControl>
			<Button
				variant="contained"
				fullWidth={true}
				style={{ margin: "5px 0" }}
				endIcon={<SaveIcon />}
				onClick={saveTissues}
				disabled={false}
			>
				Save
			</Button>
			<Button
				variant="outlined"
				color="error"
				fullWidth={true}
				style={{ margin: "5px 0" }}
				endIcon={<SettingsBackupRestoreIcon />}
				onClick={() => {
					setTissues(originalTissueSettings);
					saveTissues();
				}}
			>
				Restore defaults
			</Button>
			<FormHelperText
				color="primary"
				style={{ textAlign: "right", margin: "0px" }}
			>
				All previous M-value settings will be lost.
			</FormHelperText>
		</>
	);
};

export default Settings;
