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
    getAuthenticatedUser
} from "./handlers/users";
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
app.delete("/scream/:id", FirebaseAuth, deleteScream)

// User Routes
app.post("/user/image", FirebaseAuth, uploadImage);
app.post("/user", FirebaseAuth, addUserDetails);
app.get("/user", FirebaseAuth, getAuthenticatedUser);

// Auth Routes
app.post("/signup", signupRoute);
app.post("/login", loginRoute);

// Connect Express to Firebase
exports.api = functions.https.onRequest(app);
