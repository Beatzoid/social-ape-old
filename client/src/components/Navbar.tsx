import { Link } from "react-router-dom";

import { AppBar as Appbar, Toolbar, Button } from "@material-ui/core";

export default function Navbar() {
    return (
        <Appbar>
            <Toolbar className="nav-container">
                <Button color="inherit" component={Link} to="/home">
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
