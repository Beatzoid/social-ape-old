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

interface LoginState {
    [key: string]: any;
}

class Login extends Component<{}, LoginState> {
    constructor() {
        super({});
        this.state = {
            email: "",
            password: "",
            loading: false,
            errors: {}
        } as any;
    }

    handleSubmit = (event: any) => {
        event.preventDefault();
        this.setState({
            loading: true
        });
        const userData: any = {
            email: this.state.email,
            password: this.state.password
        };
        axios
            .post("/login", userData)
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
                        Login
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
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            className={classes.textField}
                            helperText={errors.password}
                            error={errors.password ? true : false}
                            value={(this.state as any).password}
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
                            Login
                            {loading && (
                                <CircularProgress
                                    size={30}
                                    className={classes.progress}
                                />
                            )}
                        </Button>
                        <br />
                        <small>
                            Don't have an account? Sign up{" "}
                            <Link to="/signup">here</Link>
                        </small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid>
        );
    }
}

(Login as any).propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles as any)(Login);
