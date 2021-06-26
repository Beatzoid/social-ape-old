import { Request, Response } from "express";
import {
    addDoc,
    collection,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    orderBy,
    query,
    where
} from "firebase/firestore";
import * as functions from "firebase-functions";

import { db } from "../utils/admin";
import { isEmpty } from "../utils/validators";

export const getAllScreams = async (_req: Request, res: Response) => {
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
};

export const createScream = async (req: Request, res: Response) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
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
};

export const getScream = async (req: Request, res: Response) => {
    let screamData: Record<string, unknown> = {};

    const screamRef = doc(db, "screams", req.params.screamId);

    getDoc(screamRef)
        .then(async (document) => {
            if (!document.exists())
                return res.status(404).json({ error: "Scream not found" });

            screamData = document.data();
            screamData.screamId = document.id;
            const q = query(
                collection(db, "comments"),
                where("screamId", "==", req.params.screamId),
                orderBy("createdAt", "desc")
            );

            const data = await getDocs(q);
            screamData.comments = [];
            data.forEach((comment) => {
                (screamData.comments as Array<DocumentData>).push(
                    comment.data()
                );
            });
            return res.json(screamData);
        })
        .catch((err) => {
            functions.logger.error(err.message);
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
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

    const screamRef = doc(db, "screams", req.params.screamId);

    getDoc(screamRef)
        .then(async (doc) => {
            if (!doc.exists())
                return res.status(404).json({ error: "Scream not found" });

            await addDoc(collection(db, "comments"), newComment);
            return res.json(newComment);
        })
        .catch((err) => {
            functions.logger.error({ error: err.code });
            console.error(err);
            return res.status(500).json({ error: err.code });
        });

    return;
};
