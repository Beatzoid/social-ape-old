import { db } from "../utils/admin";
import { Request, Response } from "express";
import { isEmpty } from "../utils/validators";

export const getAllScreams = (_: Request, res: Response) => {
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
};

export const createScream = (req: Request, res: Response) => {
    if (isEmpty(req.body.body))
        return res.status(400).json({ body: "Body must not be empty" });

    const newScream = {
        body: req.body.body,
        username: req.user.username,
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
};

// Get a single scream
export const getScream = (req: Request, res: Response) => {
    let screamData: any = {};
    db.doc(`/screams/${req.params.id}`)
        .get()
        // @ts-ignore
        .then((doc) => {
            if (!doc.exists)
                return res.status(404).json({ error: "Scream not found" });
            screamData = doc.data();
            screamData.screamId = doc.id;
            return db
                .collection(`comments`)
                .orderBy("createdAt", "desc")
                .where("screamId", "==", req.params.id)
                .get();
        })
        .then((data) => {
            screamData.comments = [];
            // @ts-ignore
            data.forEach((doc) => {
                screamData.comments.push(doc.data());
            });
            return res.json(screamData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Comment on a scream
export const commentOnScream = (req: Request, res: Response) => {
    if (isEmpty(req.body.body))
        return res.status(400).json({ error: "Cannot be empty" });

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamId: req.params.id,
        username: req.user.username,
        userImage: req.user.imageUrl
    };

    db.doc(`/screams/${req.params.id}`)
        .get()
        // @ts-ignore
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Scream not found" });
            }
            return db.collection("comments").add(newComment);
        })
        .then(() => {
            return res.json(newComment);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: "Something went wrong" });
        });
};
