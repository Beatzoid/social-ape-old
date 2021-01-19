import { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import AppIcon from "../images/icon.png";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import { Link } from "react-router-dom";

const styles = (theme: any) => ({
    ...theme.loginRegisterStyles
});

interface RegisterState {
    [key: string]: any;
}

class Register extends Component<{}, RegisterState> {
    constructor() {
        super({});
        this.state = {
            email: "",
            password: "",
            confirmPassword: "",
            username: "",
            loading: false,
            errors: {}
        } as any;
    }

    handleSubmit = (event: any) => {
        event.preventDefault();
        this.setState({
            loading: true
        });
        const newUserData: any = {
            email: this.state.email,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword,
            username: this.state.username
        };

        axios
            .post("/signup", newUserData)
            .then((res) => {
                localStorage.setItem("FBIdToken", `Bearer ${res.data.token}`);
                this.setState({
                    loading: false
                });
                (this.props as any).history.push("/");
            })
            .catch((err) => {
                this.setState({
                    errors: err.response.data,
                    loading: false
                });
            });
    };

    handleChange = (event: any) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {
        const { classes } = this.props as any;
        const { errors, loading } = this.state;

        return (
            <Grid container className={classes.form}>
                <Grid item sm />
                <Grid item sm>
                    <img src={AppIcon} alt="Logo" className={classes.image} />
                    <Typography variant="h2" className={classes.pageTitle}>
                        Sign Up
                    </Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField
                            id="email"
                            name="email"
                            type="email"
                            label="Email"
                            className={classes.textField}
                            helperText={errors.email}
                            error={errors.email ? true : false}
                            value={this.state.email}
                            onChange={this.handleChange}
                            fullWidth
                        />
                        <TextField
                            id="username"
                            name="username"
                            type="text"
                            label="Username"
                            className={classes.textField}
                            helperText={errors.username}
                            error={errors.username ? true : false}
                            value={this.state.username}
                            onChange={this.handleChange}
                            fullWidth
                        />
                        <TextField
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            className={classes.textField}
                            helperText={errors.password}
                            error={errors.password ? true : false}
                            value={this.state.password}
                            onChange={this.handleChange}
                            fullWidth
                        />
                        <TextField
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            className={classes.textField}
                            helperText={errors.confirmPassword}
                            error={errors.confirmPassword ? true : false}
                            value={this.state.confirmPassword}
                            onChange={this.handleChange}
                            fullWidth
                        />

                        {errors.general && (
                            <Typography
                                variant="body2"
                                className={classes.customError}
                            >
                                {errors.general}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            disabled={loading}
                        >
                            Sign Up
                            {loading && (
                                <CircularProgress
                                    size={30}
                                    className={classes.progress}
                                />
                            )}
                        </Button>
                        <br />
                        <small>
                            Already have an account? Login{" "}
                            <Link to="/login">here</Link>
                        </small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid>
        );
    }
}

(Register as any).propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles as any)(Register);
