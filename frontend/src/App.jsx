import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./util/theme";
import Protected from "./components/Protected";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Recreational from "./pages/Recreational";
import Technical from "./pages/Technical";
import DiveLog from "./pages/DiveLog";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Redirect from "./pages/Redirect";
import Footer from "./components/Footer";

function App() {
	return (
		<>
			<ThemeProvider theme={theme}>
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/recreational" element={<Recreational />} />
					<Route
						path="/technical"
						element={
							<Protected>
								<Technical />
							</Protected>
						}
					/>
					<Route
						path="/divelog"
						element={
							<Protected>
								<DiveLog />
							</Protected>
						}
					/>
					<Route
						path="/settings"
						element={
							<Protected>
								<Settings />
							</Protected>
						}
					/>
					<Route path="/login" element={<Login />} />
					<Route path="/redirect" element={<Redirect />} />
					<Route
						path="/register"
						element={
							<Protected>
								<Register />
							</Protected>
						}
					/>
				</Routes>
				<Footer />
			</ThemeProvider>
		</>
	);
}

export default App;
