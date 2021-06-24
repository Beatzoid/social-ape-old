import { Request, Response } from "express";
import {
    addDoc,
    collection,
    DocumentData,
    getDocs,
    orderBy,
    query
} from "firebase/firestore";
import * as functions from "firebase-functions";

import { db } from "../utils/admin";

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
