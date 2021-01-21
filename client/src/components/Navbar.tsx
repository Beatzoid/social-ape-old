import { Component } from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import ToolBar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import AddIcon from "@material-ui/icons/Add";
import HomeIcon from "@material-ui/icons/Home";
import Notifications from "@material-ui/icons/Notifications";

import CustomButton from "../utils/CustomButton";

class Navbar extends Component {
    render() {
        const { authenticated } = this.props as any;

        return (
            <AppBar>
                <ToolBar className="nav-container">
                    {authenticated ? (
                        <>
                            <CustomButton tip="Post a Scream!">
                                <AddIcon />
                            </CustomButton>
                            <Link to="/">
                                <CustomButton tip="Home">
                                    <HomeIcon />
                                </CustomButton>
                            </Link>
                            <CustomButton tip="Notifications">
                                <Notifications />
                            </CustomButton>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/login"
                            >
                                Login
                            </Button>
                            <Button color="inherit" component={Link} to="/">
                                Home
                            </Button>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/signup"
                            >
                                Signup
                            </Button>
                        </>
                    )}
                </ToolBar>
            </AppBar>
        );
    }
}

(Navbar as any).propTypes = {
    authenticated: PropTypes.bool.isRequired
};

const mapStateToProps = (state: any) => ({
    authenticated: state.user.authenticated
});

export default connect(mapStateToProps)(Navbar);
