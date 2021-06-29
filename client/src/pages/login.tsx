import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Grid, TextField, Typography } from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import { WithStyles, withStyles } from "@material-ui/styles";
import axios from "axios";

import AppIcon from "../images/icon.png";
import { FormStyles } from "../utils/formStyles";

// interface LoginProps extends WithStyles<typeof styles> {}

function Login({ classes }: WithStyles<typeof FormStyles>) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const history = useHistory();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        axios
            .post("/login", { email, password })
            .then((res) => {
                localStorage.setItem("FBIdToken", `Bearer ${res.data.token}`);
                setLoading(false);
                history.push("/");
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
                setErrors(err.response.data);
            });
        return 0;
    };

    return (
        <Grid container className={classes.form}>
            <Grid item sm />
            <Grid item sm>
                <img src={AppIcon} alt="App icon" className={classes.image} />
                <Typography variant="h2" className={classes.pageTitle}>
                    Login
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        id="email"
                        name="email"
                        type="email"
                        label="Email"
                        className={classes.textField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        helperText={errors.email}
                        error={!!errors.email}
                    />
                    <TextField
                        id="password"
                        name="password"
                        type="password"
                        label="Password"
                        className={classes.textField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        helperText={errors.password}
                        error={!!errors.password}
                    />
                    {errors.general && (
                        <Typography
                            variant="body2"
                            className={classes.customError}
                        >
                            {errors.general}
                        </Typography>
                    )}
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        loading={loading}
                        disabled={email.trim() === "" || password.trim() === ""}
                    >
                        Login
                    </LoadingButton>
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

export default withStyles(FormStyles)(Login);
