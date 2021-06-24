import * as functions from "firebase-functions";
import { Request, Response } from "express";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword
} from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";

import { db, firebaseApp } from "../utils/admin";
import { validateLogin, validateSignup } from "../utils/validators";

export const signupUser = async (req: Request, res: Response) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    const errors: Record<string, string> = validateSignup(newUser);

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    const docRef = doc(db, `/users/${newUser.handle}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return res.status(400).json({ handle: "This handle is already taken" });
    }

    const auth = getAuth(firebaseApp);

    createUserWithEmailAndPassword(auth, newUser.email, newUser.password)
        .then(async (data) => {
            // Get user token
            const token = await data.user?.getIdToken();

            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId: data.user?.uid
            };

            // Save user inside Firestore
            await addDoc(collection(db, "users"), userCredentials);

            functions.logger.log(
                `User ${data.user?.uid} signed up successfully`
            );
            return res.status(201).json({
                token
            });
        })
        .catch((err) => {
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({ email: "Email already in use" });
            } else {
                functions.logger.error(err);
                console.error(err);
                return res.status(500).json({
                    error: err.code
                });
            }
        });

    // Only because typescript won't shut up
    return;
};

export const loginUser = async (req: Request, res: Response) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const errors: Record<string, string> = validateLogin(user);

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    const auth = getAuth(firebaseApp);
    signInWithEmailAndPassword(auth, user.email, user.password)
        .then(async (data) => {
            const token = await data.user.getIdToken(true);
            return res.json({ token });
        })
        .catch((err) => {
            if (err.code === "auth/wrong-password")
                return res
                    .status(403)
                    .json({ general: "Incorrect login credentials" });
            else {
                functions.logger.error(err);
                console.error(err);
                return res.status(500).json({ error: err.code });
            }
        });

    return;
};
