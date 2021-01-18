import { db } from "../utils/admin";
import { Request, Response } from "express";
import { QuerySnapshot, DocumentData } from "@google-cloud/firestore";
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

    const newScream: any = {
        body: req.body.body,
        username: req.user.username,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    db.collection("screams")
        .add(newScream)
        .then((doc) => {
            const resScream = newScream;
            resScream.screamId = doc.id;
            res.json(resScream);
        })
        .catch((err) => {
            res.status(500).json({ error: "Something went wrong!" });
            console.error(err);
        });
};

export const getScream = (req: Request, res: Response) => {
    let screamData: any = {};
    db.doc(`/screams/${req.params.id}`)
        .get()
        .then((doc) => {
            if (!doc.exists)
                return res.status(404).json({ error: "Scream not found" });
            screamData = doc.data();
            screamData.screamId = doc.id;
            return (db
                .collection(`comments`)
                .orderBy("createdAt", "desc")
                .where("screamId", "==", req.params.id)
                .get() as unknown) as QuerySnapshot<DocumentData>;
        })
        .then((data: any) => {
            screamData.comments = [];
            data.forEach((doc: any) => {
                screamData.comments.push(doc.data());
            });
            return res.json(screamData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

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
        .then((doc) => {
            if (!doc.exists) {
                return res
                    .status(404)
                    .json({ error: "Scream not found" }) as any;
            }
            return doc.ref.update({
                commentCount: doc?.data()?.commentCount + 1
            });
        })
        .then(() => {
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

export const likeScream = (req: Request, res: Response) => {
    const likeDocument = db
        .collection("likes")
        .where("username", "==", req.user.username)
        .where("screamId", "==", req.params.id)
        .limit(1);

    const screamDocument = db.doc(`/screams/${req.params.id}`);

    let screamData: any;

    screamDocument
        .get()
        .then((doc) => {
            if (doc.exists) {
                screamData = doc.data();
                screamData.screamId = doc.id;
                return likeDocument.get();
            } else {
                res.status(404).json({ error: "Scream not found" });
                // We can't return the res.status or Typescript yells at us
                // with a very large error
                return;
            }
        })
        .then((data) => {
            if (data?.empty) {
                return db
                    .collection("likes")
                    .add({
                        screamId: req.params.id,
                        username: req.user.username
                    })
                    .then(() => {
                        screamData.likeCount++;
                        return screamDocument.update({
                            likeCount: screamData.likeCount
                        });
                    })
                    .then(() => {
                        return res.json(screamData);
                    });
            } else {
                return res.status(400).json({ error: "Scream already liked" });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: err.code });
        });
};

export const unlikeScream = (req: Request, res: Response) => {
    const likeDocument = db
        .collection("likes")
        .where("username", "==", req.user.username)
        .where("screamId", "==", req.params.id)
        .limit(1);

    const screamDocument = db.doc(`/screams/${req.params.id}`);

    let screamData: any;

    screamDocument
        .get()
        .then((doc) => {
            if (doc.exists) {
                screamData = doc.data();
                screamData.screamId = doc.id;
                return likeDocument.get();
            } else {
                res.status(404).json({ error: "Scream not found" });
                // We can't return the res.status or Typescript yells at us
                // with a very large error
                return;
            }
        })
        .then((data) => {
            if (data?.empty) {
                return res.status(400).json({ error: "Scream not liked" });
            } else {
                return db
                    .doc(`/likes/${data?.docs[0].id}`)
                    .delete()
                    .then(() => {
                        screamData.likeCount--;
                        return screamDocument.update({
                            likeCount: screamData.likeCount
                        });
                    })
                    .then(() => {
                        return res.json(screamData);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: err.code });
        });
};

export const deleteScream = (req: Request, res: Response) => {
    const document = db.doc(`/screams/${req.params.id}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res
                    .status(404)
                    .json({ error: "Scream not found" }) as unknown;
            }

            if (doc?.data()?.username !== req.user.username) {
                return res.status(403).json({ error: "Unauthorized" });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            return res.json({ message: "Scream deleted successfully" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
