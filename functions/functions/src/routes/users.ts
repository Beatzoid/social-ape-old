import * as functions from "firebase-functions";
import { Request, Response } from "express";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword
} from "firebase/auth";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    where,
    query,
    getDocs,
    DocumentData
} from "firebase/firestore";
import { getDownloadURL, ref, getStorage } from "firebase/storage";

import Busboy from "busboy";
import crypto from "crypto";
import path from "path";
import os from "os";
import fs from "fs";

import { admin, db, firebaseApp } from "../utils/admin";
import {
    validateLogin,
    validateSignup,
    reduceUserDetails
} from "../utils/validators";
import { handleError } from "../utils/handleError";

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

    // Try to get the user by the specified user handle
    const docRef = doc(db, `/users/${newUser.handle}`);
    const docSnap = await getDoc(docRef);

    // If the above exists, return an error
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
                doc(db, `users/${userCredentials.handle}`),
                userCredentials
            );

            functions.logger.log(
                `User ${data.user?.uid} signed up successfully`
            );
            return res.status(201).json({
                token
            });
        })
        .catch((err) => handleError(err, res));

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
        .catch((err) => handleError(err, res));

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
        // If the file is not an image type return an error
        if (!mimetype.includes("image"))
            return res.status(400).json({ error: "Unsupported file type" });

        // Get the image extension
        // image.png -> png
        // image1.image.png -> png
        const imageExtension =
            filename.split(".")[filename.split(".").length - 1];

        // Generate the image file name and temp path on the OS
        imageFilename = `${req.user.handle}-${generatedToken}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFilename);

        imageToBeUploaded = { filepath, mimetype, imageFilename };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on("finish", () => {
        // Upload the file to firebase
        admin
            .storage()
            .bucket(process.env.STORAGE_BUCKET)
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                destination: `images/${imageFilename}`,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                        firebaseStorageDownloadTokens: generatedToken
                    }
                }
            })
            .then(async () => {
                // eslint-disable-next-line max-len
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.STORAGE_BUCKET}/o/images%2F${imageFilename}?alt=media&token=${generatedToken}`;
                const userRef = doc(db, `/users/${req.user.handle}`);

                // Update the user's image url in the database
                await updateDoc(userRef, { imageUrl });
                return res.json({ message: "Image uploaded successfully" });
            })
            .catch((err) => handleError(err, res));
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    busboy.end(req.rawBody);
};

export const addUserDetails = async (req: Request, res: Response) => {
    const userDetails = reduceUserDetails(req.body);

    // Get the user from thw database
    const userRef = doc(db, `/users/${req.user.handle}`);

    updateDoc(userRef, userDetails)
        .then(() => {
            return res.json({ message: "Details added successfully" });
        })
        .catch((err) => handleError(err, res));
};

export const getUser = async (req: Request, res: Response) => {
    const userData: Record<string, unknown> = {};

    // Get the user from the database
    const docRef = doc(db, `users/${req.user.handle}`);

    getDoc(docRef)
        .then(async (doc) => {
            if (doc.exists()) {
                userData.credentials = doc.data();
                // Get all the likes for the user
                const likesQuery = query(
                    collection(db, "likes"),
                    where("userHandle", "==", req.user.handle)
                );

                // Save the likes inside the object
                const likes = await getDocs(likesQuery);
                userData.likes = [];
                likes.forEach((like) => {
                    (userData.likes as Array<DocumentData>).push(like.data());
                });
                return res.json(userData);
            } else return;
        })
        .catch((err) => handleError(err, res));
};
