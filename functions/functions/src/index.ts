// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";

import { initializeApp } from "firebase/app";
import {
    getFirestore,
    query,
    collection,
    getDocs,
    orderBy,
    doc,
    addDoc,
    getDoc,
    DocumentData
} from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

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
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();

// Get all screams
app.get("/screams", async (_req, res) => {
    const q = query(collection(db, "screams"), orderBy("createdAt", "desc"));

    getDocs(q)
        .then((data) => {
            const screams: DocumentData[] = [];
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

    addDoc(collection(db, "screams"), newScream)
        .then((document) => {
            functions.logger.info(
                `Document ${document.id} created successfully`
            );
            return res.json({
                message: `Document ${document.id} created successfully`
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

    const docRef = doc(db, `/users/${newUser.handle}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return res.status(400).json({ handle: "This handle is already taken" });
    }

    const auth = getAuth(firebaseApp);

    createUserWithEmailAndPassword(auth, newUser.email, newUser.password)
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
            await addDoc(collection(db, "users"), userCredentials);

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
