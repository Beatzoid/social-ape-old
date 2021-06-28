import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography } from "@material-ui/core";
import { WithStyles, withStyles } from "@material-ui/styles";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Scream as ScreamType } from "../utils/types";

const styles = {
    card: {
        display: "flex",
        marginBottom: 20
    },
    content: {
        padding: 25
    },
    image: {
        minWidth: 200
    }
};

interface ScreamProps extends WithStyles<typeof styles> {
    scream: ScreamType;
}

function Scream({ scream, classes }: ScreamProps) {
    dayjs.extend(relativeTime);

    return (
        <Card className={classes.card}>
            <CardMedia
                image={scream.userImage}
                title="Profile Image"
                className={classes.image}
            />
            <CardContent className={classes.content}>
                <Typography
                    variant="h5"
                    component={Link}
                    to={`/users/${scream.userHandle}`}
                    color="primary"
                >
                    {scream.userHandle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {dayjs(scream.createdAt).fromNow()}
                </Typography>
                <Typography variant="body1">{scream.body}</Typography>
            </CardContent>
        </Card>
    );
}

export default withStyles(styles)(Scream);
