import { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";

import Navbar from "./components/Navbar";

class App extends Component {
    render() {
        return (
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
        );
    }
}

export default App;
