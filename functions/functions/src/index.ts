// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import firebase from "firebase";

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGE_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

admin.initializeApp();
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

const app = express();

// Get all screams
app.get("/screams", async (_req, res) => {
    db.collection("screams")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            const screams: FirebaseFirestore.DocumentData[] = [];
            data.forEach((doc) => {
                screams.push({ screamId: doc.id, ...doc.data() });
            });
            return res.json(screams);
        })
        .catch((err) => {
            functions.logger.error(err);
            console.error(err);
            return res.status(500).json({
                error: "Something went wrong, please try again later"
            });
        });
});

// Create scream
app.post("/scream", async (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db.collection("screams")
        .add(newScream)
        .then((doc) => {
            functions.logger.info(`Document ${doc.id} created successfully`);
            return res.json({
                message: `Document ${doc.id} created successfully`
            });
        })
        .catch((err: unknown) => {
            functions.logger.error(err);
            console.error(err);
            return res.status(500).json({
                error: "Something went wrong, please try again later"
            });
        });
});

// Signup Route
app.post("/signup", async (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    // TODO Validate data

    const doc = await db.doc(`/users/${newUser.handle}`).get();
    if (doc.exists) {
        return res.status(400).json({ handle: "This handle is already taken" });
    }

    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(async (data) => {
            // Get user token
            const token = await data.user?.getIdToken();

            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId: data.user?.uid
            };

            // Save user inside Firestore
            await db.doc(`/users/${newUser.handle}`).set(userCredentials);

            functions.logger.log(
                `User ${data.user?.uid} signed up successfully`
            );
            return res.status(201).json({
                token
            });
        })
        .catch((err) => {
            functions.logger.error(err);
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({ email: "Email already in use" });
            } else {
                return res.status(500).json({
                    error: err.code
                });
            }
        });

    // Only because typescript won't shut up
    return;
});

exports.api = functions.https.onRequest(app);
