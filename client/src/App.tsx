import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@material-ui/core";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";

import Navbar from "./components/Navbar";

export default function App() {
    const theme = createTheme({
        palette: {
            primary: {
                light: "#33c9dc",
                main: "#00bcd4",
                dark: "#008394",
                contrastText: "#fff"
            },
            secondary: {
                light: "#ff6333",
                main: "#ff3d00",
                dark: "#b22a00",
                contrastText: "#fff"
            }
        }
    });

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <Router>
                    <Navbar />
                    <div className="container">
                        <Switch>
                            <Route path="/" component={Home} exact />
                            <Route path="/login" component={Login} exact />
                            <Route path="/signup" component={Signup} exact />
                        </Switch>
                    </div>
                </Router>
            </div>
        </ThemeProvider>
    );
}
