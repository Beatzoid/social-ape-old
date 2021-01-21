import { Component } from "react";
import Grid from "@material-ui/core/Grid";
import axios from "axios";

import Scream from "../components/Scream";
import Profile from "../components/Profile";

class Home extends Component {
    state: any = {
        screams: null
    };

    componentDidMount() {
        axios
            .get("/screams")
            .then((res) => {
                this.setState({
                    screams: res.data
                });
            })
            .catch((err) => console.error(err));
    }

    render() {
        const recentScreamsMarkup = this.state.screams ? (
            this?.state?.screams?.map((scream: any) => (
                <Scream scream={scream} key={scream.screamId} />
            ))
        ) : (
            <p>Loading...</p>
        );

        return (
            <Grid container spacing={2}>
                <Grid item sm={8} xs={12}>
                    {recentScreamsMarkup}
                </Grid>
                <Grid item sm={4} xs={12}>
                    <Profile />
                </Grid>
            </Grid>
        );
    }
}

export default Home;
