import * as functions from "firebase-functions";

// Handlers
import { createScream, getAllScreams } from "./handlers/screams";
import { loginRoute, signupRoute } from "./handlers/users";

// Express
const app = require("express")();

// Scream Routes
app.get("/screams", getAllScreams);
app.post("/scream", createScream);

// Auth Routes
app.post("/signup", signupRoute);
app.post("/login", loginRoute);

// Connect Express to Firebase
exports.api = functions.https.onRequest(app);
