import { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import MuiLink from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

import LocationOn from "@material-ui/icons/LocationOn";
import LinkIcon from "@material-ui/icons/Link";
import CalendarToday from "@material-ui/icons/CalendarToday";
import EditIcon from "@material-ui/icons/Edit";
import KeyboardReturn from "@material-ui/icons/KeyboardReturn";

import { uploadImage, logoutUser } from "../redux/actions/userActions";

const styles: any = (theme: any) => ({
    paper: {
        padding: 20
    },
    profile: {
        "& .image-wrapper": {
            textAlign: "center",
            position: "relative",
            "& button": {
                position: "absolute",
                top: "80%",
                left: "70%"
            }
        },
        "& .profile-image": {
            width: 200,
            height: 200,
            objectFit: "cover",
            maxWidth: "100%",
            borderRadius: "50%"
        },
        "& .profile-details": {
            textAlign: "center",
            "& span, svg": {
                verticalAlign: "middle"
            },
            "& a": {
                color: theme.palette.primary.main
            }
        },
        "& hr": {
            border: "none",
            margin: "0 0 10px 0"
        },
        "& svg.button": {
            "&:hover": {
                cursor: "pointer"
            }
        }
    },
    buttons: {
        textAlign: "center",
        "& a": {
            margin: "20px 10px"
        }
    }
});

class Profile extends Component {
    handleImageChange = (event: any) => {
        const image = event.target.files[0];
        const formData = new FormData();
        formData.append("image", image, image.name);
        (this.props as any).uploadImage(formData);
    };

    handleEditPicture = () => {
        const fileInput = document.getElementById("imageInput");
        fileInput?.click();
    };

    handleLogout = () => {
        (this.props as any).logoutUser();
    };

    render() {
        const {
            classes,
            user: {
                credentials: {
                    username,
                    createdAt,
                    imageUrl,
                    bio,
                    website,
                    location
                },
                loading,
                authenticated
            }
        } = this.props as any;

        let profileMarkup = !loading ? (
            authenticated ? (
                <Paper className={classes.paper}>
                    <div className={classes.profile}>
                        <div className="image-wrapper">
                            <img
                                src={imageUrl}
                                alt="Profile"
                                className="profile-image"
                            />
                            <input
                                type="file"
                                id="imageInput"
                                hidden={true}
                                onChange={this.handleImageChange}
                            />
                            <Tooltip title="Edit Profile Image" placement="top">
                                <IconButton
                                    onClick={this.handleEditPicture}
                                    className="button"
                                >
                                    <EditIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <hr />
                        <div className="profile-details">
                            <MuiLink
                                component={Link}
                                to={`/users/${username}`}
                                color="primary"
                                variant="h5"
                            >
                                @{username}
                            </MuiLink>
                            <hr />
                            {bio && (
                                <Typography variant="body2">{bio}</Typography>
                            )}
                            <hr />
                            {location && (
                                <>
                                    <LocationOn color="primary" />{" "}
                                    <span>{location}</span>
                                    <hr />
                                </>
                            )}
                            {website && (
                                <>
                                    <LinkIcon color="primary" />
                                    <a
                                        href={website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {" "}
                                        {website}
                                    </a>
                                    <hr />
                                </>
                            )}
                            <CalendarToday color="primary" />{" "}
                            <span>
                                Joined {dayjs(createdAt).format("MMM YYYY")}
                            </span>
                        </div>
                        <Tooltip title="Logout" placement="top">
                            <IconButton onClick={this.handleLogout}>
                                <KeyboardReturn color="primary" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </Paper>
            ) : (
                <Paper className={classes.paper}>
                    <Typography variant="body2" align="center">
                        No profile found, please Login or Sign Up.
                    </Typography>
                    <div className={classes.buttons}>
                        <Button
                            variant="contained"
                            color="primary"
                            component={Link}
                            to="/login"
                        >
                            Login
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to="/signup"
                        >
                            Sign Up
                        </Button>
                    </div>
                </Paper>
            )
        ) : (
            <p>Loading</p>
        );

        return profileMarkup;
    }
}

const mapStateToProps = (state: any) => ({
    user: state.user
});

const mapActionsToProps = { logoutUser, uploadImage };

(Profile as any).propTypes = {
    logoutUser: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
};

export default connect(
    mapStateToProps,
    mapActionsToProps
)(withStyles(styles)(Profile));
