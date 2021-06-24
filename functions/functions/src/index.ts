/* eslint-disable operator-linebreak */
/* eslint-disable max-len */

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
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword
} from "firebase/auth";

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

const isEmpty = (string: string) => {
    if (string.trim() === "") return true;
    else return false;
};

const isEmail = (email: string) => {
    const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (email.match(emailRegex)) return true;
    else return false;
};

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

    const errors: Record<string, string> = {};

    if (isEmpty(newUser.email)) errors.email = "Must not be empty ";
    else if (!isEmail(newUser.email))
        errors.email = "Must be a valid email address";

    if (isEmpty(newUser.password)) errors.password = "Must not be empty";
    if (newUser.password !== newUser.confirmPassword)
        errors.confirmPassword = "Passwords must match";

    if (isEmpty(newUser.handle)) errors.handle = "Must not be empty ";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({ email: "Email already in use" });
            } else {
                functions.logger.error(err);
                console.error(err);
                return res.status(500).json({
                    error: err.code
                });
            }
        });

    // Only because typescript won't shut up
    return;
});

// Login Route
app.post("/login", async (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const errors: Record<string, string> = {};

    if (isEmpty(user.email)) errors.email = "Must not be empty";
    if (isEmpty(user.password)) errors.password = "Must not be empty";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    const auth = getAuth(firebaseApp);
    signInWithEmailAndPassword(auth, user.email, user.password)
        .then(async (data) => {
            const token = await data.user.getIdToken();
            return res.json({ token });
        })
        .catch((err) => {
            if (err.code === "auth/wrong-password")
                return res
                    .status(403)
                    .json({ general: "Incorrect login credentials" });
            else {
                functions.logger.error(err);
                console.error(err);
                return res.status(500).json({ error: err.code });
            }
        });

    return;
});

exports.api = functions.https.onRequest(app);
