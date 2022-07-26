import React, { useState, useEffect } from "react";
import { nodeApi } from "../api/nodeApi";
import { Button } from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import AirIcon from "@mui/icons-material/Air";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import HomeIcon from "@mui/icons-material/Home";

import message from "../util/message";

const DiveLogEntry = ({ log, getDiveLogs, setEdit }) => {
	const { get, del } = nodeApi();
	const [site, setSite] = useState("");
	const [details, setDetails] = useState(false);

	const getSite = async () => {
		const response = await get(`/divesite/${log.site}`);
		setSite(response.data.diveSite);
	};

	useEffect(() => {
		getSite();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const deleteEntry = async () => {
		const response = await del(`/divelog/${log._id}`);
		if (response.status === 200) {
			getDiveLogs();
			message("Entry deleted.");
		}
	};

	const dataStyle = {
		minWidth: "210px",
		margin: "0px 0px 10px 10px",
	};

	const getWeatherIcon = (weather) => {
		const iconStyle = { position: "relative", top: "5px", fontSize: "21px" };
		switch (weather) {
			case "clear":
				return <WbSunnyIcon style={iconStyle} />;
			case "cloudy":
				return <WbCloudyIcon fontSize="small" style={iconStyle} />;
			case "windy":
				return <AirIcon fontSize="small" style={iconStyle} />;
			case "stormy":
				return <ThunderstormIcon fontSize="small" style={iconStyle} />;
			case "indoor":
				return <HomeIcon fontSize="small" style={iconStyle} />;
			default:
				break;
		}
	};

	return (
		<div
			style={{
				position: "relative",
				borderTop: "1px solid rgba(15, 26, 67, 1)",
			}}
		>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "space-between",
					margin: "10px 10px 0px 0px",
				}}
			>
				<div style={dataStyle}>
					<p>Date: {new Date(log.time).toLocaleString()}</p>
					<p>Location:</p>
					<p>dive site: {site.name}</p>
					<p>country: {site.country}</p>
				</div>
				<div style={dataStyle}>
					<p>Dive:</p>
					<p>duration: {log.duration} min</p>
					<p>max. depth: {log.maxDepth} m</p>
					{details && <p>avg. depth: {log.avgDepth} m</p>}
				</div>
				{details && (
					<div style={dataStyle}>
						<p>water body: {site.waterBody}</p>
						<p>water temp: {log.waterTemp} °C</p>
						<p>
							weather: {log.weather} {getWeatherIcon(log.weather)}
						</p>
						<p>entry: {site.diveType}</p>
					</div>
				)}
				{details && (
					<div style={dataStyle}>
						<p>cylinder size: {log.cylinders[0].size} l</p>
						<p>start: {log.cylinders[0].startPressure} bar </p>
						<p>end: {log.cylinders[0].endPressure} bar</p>
						<p>SAC rate: {log.gasConsumption.toFixed(1)} l/min</p>
					</div>
				)}
			</div>
			<Button
				variant="text"
				size="small"
				style={{
					position: "absolute",
					top: "10px",
					right: "0",
				}}
				color={details ? "attention" : "primary"}
				onClick={() => setDetails(!details)}
			>
				<InfoIcon style={{ fontSize: "30px" }} />
			</Button>
			{details && (
				<Button
					variant="text"
					size="small"
					style={{
						position: "absolute",
						top: "50px",
						right: "0px",
					}}
					color={"primary"}
					onClick={() => setEdit(log)}
				>
					<BuildCircleIcon style={{ fontSize: "30px" }} />
				</Button>
			)}

			{details && (
				<Button
					variant="text"
					size="small"
					style={{
						position: "absolute",
						top: "90px",
						right: "0px",
					}}
					color="error"
					onClick={deleteEntry}
				>
					<DeleteForeverIcon style={{ fontSize: "30px" }} />
				</Button>
			)}
		</div>
	);
};

export default DiveLogEntry;
