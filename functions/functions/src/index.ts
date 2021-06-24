// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import * as functions from "firebase-functions";
import express from "express";

import { FBAuth } from "./utils/FirebaseAuth";

// Routes
import { createScream, getAllScreams } from "./routes/screams";
import { loginUser, signupUser } from "./routes/users";

const app = express();

// Scream Routes

app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, createScream);

// User Routes
app.post("/signup", signupUser);
app.post("/login", loginUser);

exports.api = functions.https.onRequest(app);
