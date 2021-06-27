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
    deleteScream,
    createNotification,
    deleteNotification
} from "./routes/screams";
import {
    loginUser,
    signupUser,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    getUser,
    markNotificatonsRead
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
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUser);
app.post("/notifications", FBAuth, markNotificatonsRead);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
    .document("likes/{id}")
    .onCreate((snapshot) => createNotification(snapshot, "like"));

exports.createNotificationOnComment = functions.firestore
    .document("comments/{id}")
    .onCreate((snapshot) => createNotification(snapshot, "comment"));

exports.deleteNotificationOnUnlike = functions.firestore
    .document("likes/{id}")
    .onDelete((snapshot) => deleteNotification(snapshot));
