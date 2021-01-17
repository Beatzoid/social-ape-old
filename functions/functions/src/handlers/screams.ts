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
