import { useState } from "react";

const Footer = () => {
	const [display, setDisplay] = useState(true);

	return (
		<>
			{display && (
				<footer
					style={{
						position: "fixed",
						left: "0px",
						bottom: "0px",
						zIndex: "99",
						width: "100vw",
						height: "50px",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						padding: "0px 20px 0px 20px",
						backgroundColor: "rgba(15, 26, 67, 0.95)",
						boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.6)",
					}}
					onClick={() => setDisplay(false)}
				>
					<h4>Max Vis Dive App</h4>
					<p>A Full-stack API project by Áron Tombácz.</p>
				</footer>
			)}
		</>
	);
};

export default Footer;
