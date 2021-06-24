/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { collection, where, query, getDocs, limit } from "firebase/firestore";

import { admin, db } from "./admin";

// Make sure the user is authenticated with firebase
// and if they're not don't allow them to access
// whatever route their trying to access
export const FBAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    let idToken;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
        console.error("No token found");
        return res.status(403).json({ error: "Unauthorized" });
    }

    admin
        .auth()
        .verifyIdToken(idToken, true)
        .then(async (decodedToken) => {
            console.log(decodedToken);
            req.user = decodedToken as any;

            const q = query(
                collection(db, "users"),
                where("userId", "==", req.user.uid),
                limit(1)
            );
            const docSnap = await getDocs(q);

            req.user.handle = docSnap.docs[0].data().handle;
            return next();
        })
        .catch((err) => {
            return res.status(403).json(err);
        });

    return;
};
