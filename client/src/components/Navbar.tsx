import { Link } from "react-router-dom";

import { AppBar as Appbar, Toolbar, Button } from "@material-ui/core";

export default function Navbar() {
    return (
        <Appbar color="primary">
            <Toolbar className="nav-container">
                <Button color="inherit" component={Link} to="/">
                    Home
                </Button>
                <Button color="inherit" component={Link} to="/login">
                    Login
                </Button>
                <Button color="inherit" component={Link} to="/signup">
                    Signup
                </Button>
            </Toolbar>
        </Appbar>
    );
}
