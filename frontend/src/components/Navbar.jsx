import { useState } from "react";
import { useAuth } from "../providers/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../media/pic/logo-dark.jpg";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

const Navbar = () => {
	const { token, logout } = useAuth();
	const nav = useNavigate();
	const [menuOn, setMenuOn] = useState(false);

	const navigate = (url) => {
		setMenuOn(false);
		nav(url);
	};

	return (
		<nav
			style={{
				position: "fixed",
				left: "0px",
				top: "0px",
				width: "100vw",
				height: "60px",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				padding: "0px 20px 0px 10px",
				backgroundColor: "rgba(15, 26, 67, 1)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", height: "100%" }}>
				<img style={{ height: "75%", marginRight: "10px" }} src={logo} alt="" />
				<h1>Maximum Visibility</h1>
			</div>
			<div className={menuOn ? "nav-menu nav-menu-on" : "nav-menu"}>
				<Button
					variant="text"
					size="medium"
					color="secondary"
					style={{ fontSize: "16px" }}
					onClick={() => navigate("/")}
				>
					Home
				</Button>
				<Button
					variant="text"
					size="medium"
					color="secondary"
					style={{ fontSize: "16px" }}
					onClick={() => navigate("/recreational")}
				>
					Recreational Planner
				</Button>
				<Button
					variant="text"
					size="medium"
					color="secondary"
					style={{ fontSize: "16px" }}
					onClick={() => navigate("/technical")}
				>
					Techical Planner
				</Button>
				{token && (
					<Button
						variant="text"
						size="medium"
						color="secondary"
						style={{ fontSize: "16px" }}
						onClick={() => navigate("/divelog")}
					>
						Dive Log
					</Button>
				)}
				{token && (
					<Button
						variant="text"
						size="medium"
						color="secondary"
						style={{ fontSize: "16px" }}
						onClick={() => navigate("/settings")}
					>
						Settings
					</Button>
				)}
				{!token ? (
					<Button
						variant="outlined"
						size="medium"
						color="secondary"
						startIcon={<LoginIcon />}
						style={{ fontSize: "16px" }}
						onClick={() => navigate("/login")}
					>
						Login
					</Button>
				) : (
					<Button
						variant="outlined"
						size="medium"
						color="secondary"
						startIcon={<LogoutIcon />}
						style={{ marginLeft: "10px", fontSize: "16px" }}
						onClick={() => {
							setMenuOn(false);
							logout();
						}}
					>
						Logout
					</Button>
				)}
			</div>
			<Button
				className="nav-menu-toggle"
				variant="text"
				color={menuOn ? "attention" : "secondary"}
				onClick={() => setMenuOn(!menuOn)}
			>
				{menuOn ? (
					<MenuOpenIcon style={{ fontSize: "34px" }} />
				) : (
					<MenuIcon style={{ fontSize: "34px" }} />
				)}
			</Button>
		</nav>
	);
};

export default Navbar;
