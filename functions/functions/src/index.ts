import * as functions from "firebase-functions";

// Handlers
import {
    createScream,
    getAllScreams,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream
} from "./handlers/screams";
import {
    loginRoute,
    signupRoute,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead
} from "./handlers/users";
import { db } from "./utils/admin";
import { FirebaseAuth } from "./utils/middleware";

// Express
const app = require("express")();

// Scream Routes
app.get("/screams", getAllScreams);
app.post("/scream", FirebaseAuth, createScream);
app.get("/scream/:id", getScream);
app.post("/scream/:id/comment", FirebaseAuth, commentOnScream);
app.get("/scream/:id/like", FirebaseAuth, likeScream);
app.get("/scream/:id/unlike", FirebaseAuth, unlikeScream);
app.delete("/scream/:id", FirebaseAuth, deleteScream);

// User Routes
app.post("/user/image", FirebaseAuth, uploadImage);
app.post("/user", FirebaseAuth, addUserDetails);
app.get("/user", FirebaseAuth, getAuthenticatedUser);
app.get("/user/:username", getUserDetails);
app.post("/notifications", FirebaseAuth, markNotificationsRead);

// Auth Routes
app.post("/signup", signupRoute);
app.post("/login", loginRoute);

// Connect Express to Firebase
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
    .document("likes/{id}")
    .onCreate((snapshot) => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then((doc) => {
                if (
                    doc.exists &&
                    doc?.data()?.username !== snapshot.data().username
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc?.data()?.username,
                        sender: snapshot.data().username,
                        type: "like",
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .catch((err) => console.error(err));
    });

exports.deleteNotificationOnUnlike = functions.firestore
    .document("likes/{id}")
    .onDelete((snapshot) => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => console.error(err));
    });

exports.createNotificationOnComment = functions.firestore
    .document("comments/{id}")
    .onCreate((snapshot) => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then((doc) => {
                if (
                    doc.exists &&
                    doc?.data()?.username !== snapshot.data().username
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc?.data()?.username,
                        sender: snapshot.data().username,
                        type: "comment",
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .catch((err) => console.error(err));
    });
