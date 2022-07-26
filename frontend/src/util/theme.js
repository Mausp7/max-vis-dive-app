import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		secondary: {
			//light: "rgba(218, 237, 251, 1)",
			main: "rgba(218, 237, 251, 1)",
			//dark: "rgba(218, 237, 251, 1)"
		},
		primary: {
			light: "#073ab2",
			main: "rgba(15, 26, 67, 1)",
			dark: "#0a122e",
		},
		error: {
			main: "rgba(212, 66, 53, 1)",
		},
		attention: {
			loght: "#073ab2",
			main: "rgba(10, 84, 255, 1)",
			dark: "#3b76ff",
		},
		light: {
			main: "rgba(218, 237, 251, 1)",
		},
		dark: {
			main: "rgba(89, 98, 85, 1)",
		},
	},
});

export default theme;