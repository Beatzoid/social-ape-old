import * as functions from "firebase-functions";

// Handlers
import { createScream, getAllScreams } from "./handlers/screams";
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

// User Routes
app.post("/user/image", FirebaseAuth, uploadImage);
app.post("/user", FirebaseAuth, addUserDetails);
app.get("/user", FirebaseAuth, getAuthenticatedUser)

// Auth Routes
app.post("/signup", signupRoute);
app.post("/login", loginRoute);

// Connect Express to Firebase
exports.api = functions.https.onRequest(app);
