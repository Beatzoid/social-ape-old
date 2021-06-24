import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";

admin.initializeApp();
const app = express();

app.get("/screams", async (_req, res) => {
    const data = (await admin
        .firestore()
        .collection("screams")
        .orderBy("createdAt", "desc")
        .get()
        .catch((err) => {
            functions.logger.error(err);
            console.error(err);
            return;
        })) as admin.firestore.QuerySnapshot<admin.firestore.DocumentData>;

    const screams: FirebaseFirestore.DocumentData[] = [];
    data.forEach((doc) => {
        screams.push({ screamId: doc.id, ...doc.data() });
    });

    res.json(screams);
    return;
});

app.post("/scream", async (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    const doc = (await admin
        .firestore()
        .collection("screams")
        .add(newScream)
        .catch((err: unknown) => {
            functions.logger.error(err);
            console.log(err);
            res.status(500).json({
                error: "Something went wrong, please try again later"
            });
            return;
        })) as admin.firestore.DocumentReference<admin.firestore.DocumentData>;

    functions.logger.info(`Document ${doc.id} created successfully`);
    res.json({
        message: `Document ${doc.id} created successfully`
    });

    return;
});

exports.api = functions.https.onRequest(app);
