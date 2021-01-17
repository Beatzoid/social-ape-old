const functions = require("firebase-functions");

const app = require("express")();
const admin = require("firebase-admin");
admin.initializeApp();

const firebase = require("firebase");
const config = require("./utils/config");
firebase.initializeApp(config);

const db = admin.firestore();

app.get("/screams", (req, res) => {
    db.collection("screams")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            const screams = [];
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

app.post("/scream", (req, res) => {
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

// Signup Route
app.post("/signup", (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        username: req.body.username
    };

    // TODO: Validate Data

    let token, userId;
    db.doc(`/users/${newUser.username}`)
        .get()
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
        .then((data) => {
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

exports.api = functions.https.onRequest(app);
