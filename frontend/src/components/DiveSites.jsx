import React, { useState, useEffect } from "react";
import { nodeApi } from "../api/nodeApi";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import message from "../util/message";

const DiveSites = ({ diveSites, setDiveSites }) => {
	const { get, post, del } = nodeApi();

	const [name, setName] = useState("");
	const [country, setCountry] = useState("");
	const [countries, setCountries] = useState([{ name: "Hungary" }]);
	const [waterBody, setWaterBody] = useState("");
	const [diveType, setDiveType] = useState("");

	const [deleteDiveSiteId, setDeleteDiveSiteId] = useState("");

	const getDiveSites = async () => {
		const response = await get(`/divesite/user`);
		setDiveSites(response.data.diveSites);
	};

	const getCountries = async () => {
		const response = await axios.get(
			`https://restcountries.com/v2/all?fields=name`
		);
		setCountries(response.data);
	};

	useEffect(() => {
		getCountries();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const saveDiveSite = async () => {
		if (name.length < 3) return;
		const response = await post(`/divesite`, {
			name,
			country,
			waterBody,
			diveType,
		});
		if (response.status === 200) {
			setName("");
			setCountry("");
			setWaterBody("");
			setDiveType("");
			getDiveSites();
			message("Dive site saved");
		}
	};

	const eraseDiveSite = async () => {
		const response = await del(`/divesite/${deleteDiveSiteId}`);
		if (response.status === 200) {
			getDiveSites();
			message("Dive site deleted");
		}
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: "20px",
				}}
			>
				<FormControl style={{ width: "48%" }}>
					<TextField
						id="name"
						variant="outlined"
						label="Site name"
						fullWidth={true}
						margin="normal"
						error={name !== "" && name.length < 3}
						value={name}
						onChange={(event) => {
							setName(event.target.value);
						}}
					/>
					<TextField
						select
						fullWidth={true}
						margin="normal"
						label="Country"
						value={country}
						onChange={(event) => setCountry(event.target.value)}
					>
						{countries.map((country, index) => (
							<MenuItem value={country.name} key={index}>
								{country.name}
							</MenuItem>
						))}
					</TextField>
				</FormControl>
				<FormControl style={{ width: "48%" }}>
					<TextField
						select
						fullWidth={true}
						margin="normal"
						label="Water body"
						value={waterBody}
						onChange={(event) => setWaterBody(event.target.value)}
					>
						<MenuItem value={"sea"}>sea</MenuItem>
						<MenuItem value={"lake"}>lake</MenuItem>
						<MenuItem value={"river"}>river</MenuItem>
						<MenuItem value={"cave"}>cave</MenuItem>
						<MenuItem value={"pool"}>pool</MenuItem>
						<MenuItem value={"chamber"}>chamber</MenuItem>
					</TextField>

					<TextField
						select
						fullWidth={true}
						margin="normal"
						label="Dive type"
						value={diveType}
						onChange={(event) => setDiveType(event.target.value)}
					>
						<MenuItem value={"boat"}>boat</MenuItem>
						<MenuItem value={"shore"}>shore</MenuItem>
					</TextField>
				</FormControl>
			</div>
			<Button
				variant="contained"
				color="attention"
				fullWidth={true}
				endIcon={<SaveIcon />}
				onClick={saveDiveSite}
				disabled={
					name.length < 3 || country === 0 || waterBody === 0 || diveType === 0
				}
			>
				Save
			</Button>
			<TextField
				select
				fullWidth={true}
				margin="normal"
				label="Dive site to delete"
				color="error"
				value={deleteDiveSiteId}
				onChange={(event) => setDeleteDiveSiteId(event.target.value)}
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
			<Button
				variant="contained"
				fullWidth={true}
				endIcon={<DeleteForeverIcon />}
				color="error"
				onClick={eraseDiveSite}
				disabled={deleteDiveSiteId === ""}
			>
				Delete
			</Button>
		</div>
	);
};

export default DiveSites;
