import { Component } from "react";
import Grid from "@material-ui/core/Grid";
import axios from "axios";

import Scream from "../components/Scream";

class Home extends Component {
    state: any = {
        screams: null
    };

    componentDidMount() {
        axios
            .get("/screams")
            .then((res) => {
                console.log(res.data);
                this.setState({
                    screams: res.data
                });
            })
            .catch((err) => console.error(err));
    }

    render() {
        const recentScreamsMarkup = this.state.screams ? (
            this?.state?.screams?.map((scream: any) => (
                <Scream scream={scream} key={scream.id} />  
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
                    <p>Profile</p>
                </Grid>
            </Grid>
        );
    }
}

export default Home;
