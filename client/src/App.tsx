import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@material-ui/core";
import jwtDecode from "jwt-decode";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";

import Navbar from "./components/Navbar";

import { GlobalTheme } from "./utils/theme";
import { DecodedToken } from "./utils/types";
import AuthRoute from "./utils/AuthRoute";

export default function App() {
    const theme = createTheme(GlobalTheme);
    const token = localStorage.FBIdToken;
    let authenticated = false;

    if (token) {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.exp * 1000 < Date.now()) {
            window.location.href = "/login";
            authenticated = false;
        } else {
            authenticated = true;
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <Router>
                    <Navbar />
                    <div className="container">
                        <Switch>
                            <Route path="/" component={Home} exact />
                            <AuthRoute
                                authenticated={authenticated}
                                path="/login"
                                component={Login}
                                exact
                            />
                            <AuthRoute
                                authenticated={authenticated}
                                path="/signup"
                                component={Signup}
                                exact
                            />
                        </Switch>
                    </div>
                </Router>
            </div>
        </ThemeProvider>
    );
}
