import { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import withStyles from "@material-ui/core/styles/withStyles";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import EditIcon from "@material-ui/icons/Edit";

import { editUserDetails } from "../redux/actions/userActions";
import CustomButton from "../utils/CustomButton";

const styles = (theme: any) => ({
    ...theme.spreadThis,
    button: {
        float: "right"
    }
});

class EditDetails extends Component {
    state = {
        bio: "",
        website: "",
        location: "",
        open: false
    };

    mapUserDetailsToState = (credentials: any) => {
        this.setState({
            bio: credentials.bio || "",
            website: credentials.website || "",
            location: credentials.location || ""
        });
    };

    handleOpen = () => {
        this.setState({ open: true });
        // @ts-ignore
        this.mapUserDetailsToState(this.props.credentials);
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    componentDidMount() {
        const { credentials } = this.props as any;
        this.mapUserDetailsToState(credentials);
    }

    handleChange = (event: any) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleSubmit = () => {
        const userDetails = {
            bio: this.state.bio || "",
            website: this.state.website || "",
            location: this.state.location || ""
        };

        (this.props as any).editUserDetails(userDetails);
        this.handleClose();
    };

    render() {
        const { classes } = this.props as any;

        return (
            <>
                <CustomButton
                    tip="Edit Details"
                    onClick={this.handleOpen}
                    btnClassName={classes.button}
                >
                    <EditIcon color="primary" />
                </CustomButton>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Edit your details</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField
                                name="bio"
                                type="text"
                                label="Bio"
                                multiline
                                rows="3"
                                placeholder="A short bio about yourself"
                                className={classes.textField}
                                value={this.state.bio}
                                onChange={this.handleChange}
                                fullWidth
                            />
                            <TextField
                                name="website"
                                type="text"
                                label="Website"
                                placeholder="Your amazing website"
                                className={classes.textField}
                                value={this.state.website}
                                onChange={this.handleChange}
                                fullWidth
                            />
                            <TextField
                                name="location"
                                type="text"
                                label="Location"
                                placeholder="Where you live"
                                className={classes.textField}
                                value={this.state.location}
                                onChange={this.handleChange}
                                fullWidth
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

(EditDetails as any).propTypes = {
    editUserDetails: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
};

const mapStateToProps = (state: any) => ({
    credentials: state.user.credentials
});

export default connect(mapStateToProps, { editUserDetails })(
    withStyles(styles)(EditDetails)
);
