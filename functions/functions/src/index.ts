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
    commentOnScream
} from "./routes/screams";
import {
    loginUser,
    signupUser,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser
} from "./routes/users";

const app = express();

// Scream Routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, createScream);
app.get("/scream/:screamId", getScream);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

// User Routes
app.post("/signup", signupUser);
app.post("/login", loginUser);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
