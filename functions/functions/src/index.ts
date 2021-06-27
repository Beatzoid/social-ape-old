// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import * as functions from "firebase-functions";
import express from "express";

import { FBAuth } from "./utils/FirebaseAuth";

// Routes
import {
    createScream,
    getAllScreams,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream
} from "./routes/screams";
import {
    loginUser,
    signupUser,
    uploadImage,
    addUserDetails,
    getUser
} from "./routes/users";

const app = express();

// Scream Routes
app.get("/screams", getAllScreams);

app.post("/scream", FBAuth, createScream);
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId", FBAuth, deleteScream);

app.post("/scream/:screamId/comment", FBAuth, commentOnScream);
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);

// User Routes
app.post("/signup", signupUser);
app.post("/login", loginUser);

app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getUser);

exports.api = functions.https.onRequest(app);
