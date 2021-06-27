import { Request, Response } from "express";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    updateDoc,
    where
} from "firebase/firestore";

import { db } from "../utils/admin";
import { isEmpty } from "../utils/validators";
import { handleError } from "../utils/handleError";

export const getAllScreams = async (_req: Request, res: Response) => {
    // Get all screams ordered so that
    // the newest are first and the oldest are last
    const screamsQuery = query(
        collection(db, "screams"),
        orderBy("createdAt", "desc")
    );

    getDocs(screamsQuery)
        .then((data) => {
            const screams: DocumentData[] = [];
            data.forEach((doc) => {
                screams.push({ screamId: doc.id, ...doc.data() });
            });
            return res.json(screams);
        })
        .catch((err) => handleError(err, res));
};

export const createScream = async (req: Request, res: Response) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    // Add the above object to the screams collection
    addDoc(collection(db, "screams"), newScream)
        .then((document) => {
            const resScream: Record<string, unknown> = newScream;
            resScream.screamId = document.id;
            return res.json(resScream);
        })
        .catch((err) => handleError(err, res));
};

export const getScream = async (req: Request, res: Response) => {
    let screamData: Record<string, unknown> = {};

    // Get the requested scream from the database
    const screamRef = doc(db, `/screams${req.params.screamId}`);

    getDoc(screamRef)
        .then(async (document) => {
            if (!document.exists())
                return res.status(404).json({ error: "Scream not found" });

            screamData = document.data();
            screamData.screamId = document.id;
            // Get the comments for the specified scream
            // and order them so that the newest are first
            // and the oldest are last
            const commentsQuery = query(
                collection(db, "comments"),
                where("screamId", "==", req.params.screamId),
                orderBy("createdAt", "desc")
            );

            const data = await getDocs(commentsQuery);
            screamData.comments = [];
            data.forEach((comment) => {
                (screamData.comments as Array<DocumentData>).push(
                    comment.data()
                );
            });
            return res.json(screamData);
        })
        .catch((err) => handleError(err, res));
};

export const commentOnScream = async (req: Request, res: Response) => {
    if (isEmpty(req.body.body))
        return res.status(400).json({ error: "This field is required" });

    const newComment: Record<string, string> = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    // Get the requested scream
    const screamRef = doc(db, `/screams/${req.params.screamId}`);

    getDoc(screamRef)
        .then(async (doc) => {
            if (!doc.exists())
                return res.status(404).json({ error: "Scream not found" });

            // Add the comment to the database
            await addDoc(collection(db, "comments"), newComment);
            // Update the scream's comment count
            await updateDoc(screamRef, {
                commentCount: doc.data().commentCount + 1
            });
            return res.json(newComment);
        })
        .catch((err) => handleError(err, res));

    return;
};

export const likeScream = async (req: Request, res: Response) => {
    // Fetch the likes document
    // that matches the user handle
    // and scream id match the requested ones
    const likesQuery = query(
        collection(db, "likes"),
        where("userHandle", "==", req.user.handle),
        where("screamId", "==", req.params.screamId),
        limit(1)
    );

    // Get the document for the requested scream
    const screamDocument = doc(db, `/screams/${req.params.screamId}`);

    let screamData;

    getDoc(screamDocument)
        .then(async (screamDoc) => {
            // If the scream doesn't exist return 404
            if (!screamDoc.exists())
                return res.status(404).json({ error: "Scream not found" });

            // Add the scream data to the screamData object
            screamData = screamDoc.data();
            screamData.screamId = screamDoc.id;

            // Get the likes document from the database
            const data = await getDocs(likesQuery);

            // If there is no like document
            if (data.empty) {
                // Create a document in the likes collection
                await addDoc(collection(db, "likes"), {
                    screamId: req.params.screamId,
                    userHandle: req.user.handle
                });

                // Update the scream data in the database with the correct like count
                screamData.likeCount++;
                await updateDoc(screamDocument, {
                    likeCount: screamData.likeCount
                });
                return res.json(screamData);
            } else {
                // The user already liked this scream, so
                // return an error
                return res.status(400).json({ error: "Scream already liked" });
            }
        })
        .catch((err) => handleError(err, res));
};

export const unlikeScream = async (req: Request, res: Response) => {
    // Fetch the likes document
    // that matches the user handle
    // and scream id match the requested ones
    const q = query(
        collection(db, "likes"),
        where("userHandle", "==", req.user.handle),
        where("screamId", "==", req.params.screamId),
        limit(1)
    );

    // Get the document for the requested scream
    const screamDocument = doc(db, `/screams/${req.params.screamId}`);

    let screamData;

    getDoc(screamDocument)
        .then(async (screamDoc) => {
            // If the scream doesn't exist return 404
            if (!screamDoc.exists())
                return res.status(404).json({ error: "Scream not found" });

            // Add the scream data to the screamData object
            screamData = screamDoc.data();
            screamData.screamId = screamDoc.id;

            // Get the likes document from the database
            const data = await getDocs(q);

            // If there is no like document
            if (data.empty) {
                // The user has not liked this screan
                return res.status(400).json({ error: "Scream not liked" });
            } else {
                // Delete the like document from the database
                await deleteDoc(doc(db, `likes/${data.docs[0].id}`));

                // Update the scream data in the database with the correct like count
                screamData.likeCount--;
                await updateDoc(screamDocument, {
                    likeCount: screamData.likeCount
                });
                return res.json(screamData);
            }
        })
        .catch((err) => handleError(err, res));
};

export const deleteScream = async (req: Request, res: Response) => {
    // Get the requested scream
    const document = doc(db, `/screams/${req.params.screamId}`);

    getDoc(document)
        .then(async (doc) => {
            if (!doc.exists())
                return res.status(404).json({ error: "Scream not found" });

            if (doc.data().userHandle !== req.user.handle)
                return res.status(403).json({ error: "Unauthorized" });

            await deleteDoc(document);
            return res.json({ message: "Scream successfully deleted" });
        })
        .catch((err) => handleError(err, res));
};
