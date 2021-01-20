import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import jwtDecode from "jwt-decode";
import { Provider } from "react-redux";
import store from "./redux/store";

import "./App.css";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Navbar from "./components/Navbar";
import themeFile from "./utils/theme";
import AuthRoute from "./utils/AuthRoute";

const theme = createMuiTheme(themeFile);

let authenticated: boolean;
const token = localStorage.FBIdToken;
if (token) {
    const decodedToken: any = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
        window.location.href = "/login";
        authenticated = false;
    } else {
        authenticated = true;
    }
}

function App() {
    return (
        <MuiThemeProvider theme={theme}>
            <Provider store={store}>
                <div className="App">
                    <Router>
                        <Navbar />
                        <div className="container">
                            <Switch>
                                <Route exact path="/" component={Home} />
                                <AuthRoute
                                    // @ts-ignore
                                    exact
                                    path="/login"
                                    component={Login}
                                    authenticated={authenticated}
                                />
                                <AuthRoute
                                    // @ts-ignore
                                    exact
                                    path="/signup"
                                    component={Signup}
                                    authenticated={authenticated}
                                />
                            </Switch>
                        </div>
                    </Router>
                </div>
            </Provider>
        </MuiThemeProvider>
    );
}

export default App;
