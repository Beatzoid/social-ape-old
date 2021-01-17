import * as functions from "firebase-functions";

const app = require("express")();
import { Request, Response } from "express";

import admin from "firebase-admin";
admin.initializeApp();

import firebase from "firebase";
import config from "./utils/config";
firebase.initializeApp(config);

const db = admin.firestore();

// Helper Functions
const isEmpty = (string: String) => string.trim() === "";
const isEmail = (email: String) =>
    email.match(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

app.get("/screams", (req: Request, res: Response) => {
    db.collection("screams")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            const screams: any = [];
            data.forEach((doc) => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    username: doc.data().username,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(screams);
        })
        .catch((err) => console.error(err));
});

app.post("/scream", (req: Request, res: Response) => {
    const newScream = {
        body: req.body.body,
        username: req.body.username,
        createdAt: new Date().toISOString()
    };

    db.collection("screams")
        .add(newScream)
        .then((doc) => {
            res.json({ message: `Document: ${doc.id} created successfully` });
        })
        .catch((err) => {
            res.status(500).json({ error: "Something went wrong!" });
            console.error(err);
        });
});

// @ts-ignore
// Signup Route
app.post("/signup", (req: Request, res: Response) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        username: req.body.username
    };

    let errors: any = {};

    if (isEmpty(newUser.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(newUser.email)) {
        errors.email = "Must be a valid email address";
    }

    if (isEmpty(newUser.password)) errors.password = "Must not be empty";
    if (newUser.password !== newUser.confirmPassword)
        errors.confirmPassword = "Passwords must match";
    if (isEmpty(newUser.username)) errors.username = "Must not be empty";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    // TODO: Validate Data

    let token: any, userId: any;
    db.doc(`/users/${newUser.username}`)
        .get()
        // @ts-ignore
        .then((doc) => {
            if (doc.exists) {
                return res
                    .status(400)
                    .json({ username: "This username is already taken" });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(
                        newUser.email,
                        newUser.password
                    );
            }
        })
        .then((data: any) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                username: newUser.username,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.username}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.log(err);
            if (err.code === "auth/email-already-in-use") {
                return res
                    .status(400)
                    .json({ email: "Email is already in use" });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

// @ts-ignore
app.post("/login", (req: Request, res: Response) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors: any = {};

    if (isEmpty(user.email)) errors.email = "Must not be empty";
    if (isEmpty(user.password)) errors.password = "Must not be empty";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => data?.user?.getIdToken())
        .then((token) => res.json({ token }))
        .catch((err) => {
            console.log(err);

            if (err.code === "auth/wrong-password")
                return res.status(403).json({ general: "Wrong credentials" });

            return res.status(500).json({ error: err.code });
        });
});

exports.api = functions.https.onRequest(app);
