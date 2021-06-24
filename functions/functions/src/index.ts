import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getScreams = functions.https.onRequest(async (_req, res) => {
    const data = (await admin
        .firestore()
        .collection("screams")
        .get()
        .catch((err) => {
            functions.logger.error(err);
            console.error(err);
            return;
        })) as admin.firestore.QuerySnapshot<admin.firestore.DocumentData>;

    const screams: FirebaseFirestore.DocumentData[] = [];
    data.forEach((doc) => {
        screams.push(doc.data());
    });

    res.json(screams);
    return;
});

export const createScream = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(400).json({ error: "Method not allowed" });
        return;
    }

    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    const doc = (await admin
        .firestore()
        .collection("screams")
        .add(newScream)
        .catch((err:any) => {
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
