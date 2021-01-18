import * as functions from "firebase-functions";

// Handlers
import { createScream, getAllScreams } from "./handlers/screams";
import { loginRoute, signupRoute, uploadImage } from "./handlers/users";
import { FirebaseAuth } from "./utils/middleware";

// Express
const app = require("express")();

// Scream Routes
app.get("/screams", getAllScreams);
app.post("/scream", FirebaseAuth, createScream);

// Auth Routes
app.post("/signup", signupRoute);
app.post("/login", loginRoute);
app.post("/users/image", FirebaseAuth, uploadImage);

// Connect Express to Firebase
exports.api = functions.https.onRequest(app);
