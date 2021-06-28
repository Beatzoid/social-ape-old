import { useEffect, useState } from "react";
import axios from "axios";

import { Grid } from "@material-ui/core";

import { Scream as ScreamType } from "../utils/types";

import Scream from "../components/Scream";

export default function Home() {
    const [screams, setScreams] = useState<ScreamType[]>([]);

    useEffect(() => {
        axios
            .get("/screams")
            .then((res) => {
                setScreams(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const recentScreamsMarkup = screams ? (
        screams.map((scream) => (
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
                <p>Profile</p>
            </Grid>
        </Grid>
    );
}
