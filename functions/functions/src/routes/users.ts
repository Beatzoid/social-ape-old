import * as functions from "firebase-functions";
import { Request, Response } from "express";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, getStorage } from "firebase/storage";

import Busboy from "busboy";
import crypto from "crypto";
import path from "path";
import os from "os";
import fs from "fs";

import { admin, db, firebaseApp } from "../utils/admin";
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

    // Polyfills required for Firebase
    global.XMLHttpRequest = require("xhr2");

    const imageUrl = await getDownloadURL(ref(getStorage(), "no-img.png"));

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
                imageUrl,
                userId: data.user?.uid
            };

            // Save user inside Firestore
            await setDoc(
                doc(db, "users", userCredentials.handle),
                userCredentials
            );

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

export const uploadImage = async (req: Request, res: Response) => {
    const busboy = new Busboy({ headers: req.headers });

    let imageFilename: string;
    let imageToBeUploaded: Record<string, string> = {};
    const generatedToken = crypto.randomBytes(32).toString("hex");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    busboy.on("file", (_, file, filename, __, mimetype) => {
        if (!mimetype.includes("image"))
            return res.status(400).json({ error: "Unsupported file type" });

        const imageExtension =
            filename.split(".")[filename.split(".").length - 1];

        imageFilename = `${generatedToken}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFilename);

        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on("finish", () => {
        admin
            .storage()
            .bucket(process.env.STORAGE_BUCKET)
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                        firebaseStorageDownloadTokens: generatedToken
                    }
                }
            })
            .then(async () => {
                // eslint-disable-next-line max-len
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.STORAGE_BUCKET}/o/${imageFilename}?alt=media&token=${generatedToken}`;
                const userRef = doc(db, `/users/${req.user.handle}`);

                await updateDoc(userRef, { imageUrl });
                return res.json({ message: "Image uploaded successfully" });
            })
            .catch((err) => {
                functions.logger.error(err.message);
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    busboy.end(req.rawBody);
};
