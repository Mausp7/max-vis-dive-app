import React, { useState, useEffect } from "react";
import { useAuth } from "../providers/auth";
import { nodeApi } from "../api/nodeApi";
import { Button } from "@mui/material";
import AddDiveLog from "../components/AddDiveLog";
import DiveSites from "../components/DiveSites";
import DiveLogEntry from "../components/DiveLogEntry";
import EditDiveLog from "../components/EditDiveLog";
import Spinner from "../util/Spinner";

const DiveLog = () => {
	const { user } = useAuth();
	const { get } = nodeApi();

	const [diveLogs, setDiveLogs] = useState([]);
	const [diveSites, setDiveSites] = useState([]);

	const [display, setDisplay] = useState("log");
	const [edit, setEdit] = useState("");

	const getDiveLogs = async () => {
		setDisplay("spinner");
		const response = await get(`/divelog`);
		setDiveLogs(response.data.diveLogs);
		setDisplay("log");
	};

	const getDiveSites = async () => {
		const response = await get(`/divesite/user`);
		setDiveSites(response.data.diveSites);
	};

	useEffect(() => {
		getDiveLogs();
		getDiveSites();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="main-container">
			<h2>{`${user?.username}'s Dive Log`}</h2>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					margin: "0px 0px 15px",
				}}
			>
				<Button
					variant={display === "log" ? "outlined" : ""}
					color={display === "log" ? "attention" : "primary"}
					onClick={() => {
						setDisplay("log");
						setEdit("");
					}}
				>
					Dive log
				</Button>
				<Button
					variant={display === "newlog" ? "outlined" : ""}
					color={display === "newlog" ? "attention" : "primary"}
					onClick={() => {
						setDisplay("newlog");
						setEdit("");
					}}
				>
					New entry
				</Button>
				<Button
					variant={display === "divesite" ? "outlined" : ""}
					color={display === "divesite" ? "attention" : "primary"}
					onClick={() => {
						setDisplay("divesite");
						setEdit("");
					}}
				>
					Dive sites
				</Button>
			</div>
			{edit === "" && display === "spinner" && (
				<div
					style={
						{
							/* display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "300px", */
						}
					}
				>
					<Spinner />
				</div>
			)}
			{edit === "" && display === "log" && diveLogs.length === 0 && (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "300px",
					}}
				>
					<h3>No dives in your logbook yet.</h3>
				</div>
			)}
			{edit === "" && display === "log" && diveLogs.length !== 0 && (
				<div style={{ minHeight: "40vh" }}>
					{diveLogs.map((log) => (
						<DiveLogEntry
							key={log._id}
							log={log}
							getDiveLogs={getDiveLogs}
							setEdit={setEdit}
						/>
					))}
				</div>
			)}
			{display === "newlog" && (
				<AddDiveLog diveSites={diveSites} getDiveLogs={getDiveLogs} />
			)}
			{display === "divesite" && (
				<DiveSites diveSites={diveSites} setDiveSites={setDiveSites} />
			)}
			{edit !== "" && (
				<EditDiveLog
					log={edit}
					setEdit={setEdit}
					diveSites={diveSites}
					getDiveLogs={getDiveLogs}
				/>
			)}
		</div>
	);
};

export default DiveLog;
