import { Request, Response } from "express";
import BusBoy from "busboy";
import path from "path";
import os from "os";
import fs from "fs";

import { admin, db } from "../utils/admin";
import { isEmail, isEmpty, reduceUserDetails } from "../utils/validators";
import firebase from "../utils/misc";
import config from "../utils/config";

// Fixes error, don't remove
(global as any).XMLHttpRequest = require("xhr2");

// Register
export const signupRoute = (req: Request, res: Response) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        username: req.body.username
    };

    let errors: any = {};

    if (isEmpty(newUser.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(newUser.email)) {
        errors.email = "Must be a valid email address";
    }

    if (isEmpty(newUser.password)) errors.password = "Must not be empty";
    if (newUser.password !== newUser.confirmPassword)
        errors.confirmPassword = "Passwords must match";
    if (isEmpty(newUser.username)) errors.username = "Must not be empty";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    const noImg = "no-img.png";

    let token: any, userId: any;
    db.doc(`/users/${newUser.username}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res.status(400).json({
                    username: "This username is already taken"
                }) as unknown;
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(
                        newUser.email,
                        newUser.password
                    );
            }
        })
        .then((data: any) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                username: newUser.username,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                userId
            };
            return db.doc(`/users/${newUser.username}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.log(err);
            if (err.code === "auth/email-already-in-use") {
                return res
                    .status(400)
                    .json({ email: "Email is already in use" });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
};

// Login
export const loginRoute = (req: Request, res: Response) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors: any = {};

    if (isEmpty(user.email)) errors.email = "Must not be empty";
    if (isEmpty(user.password)) errors.password = "Must not be empty";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => data?.user?.getIdToken())
        .then((token) => res.json({ token }))
        .catch((err) => {
            console.log(err);

            if (err.code === "auth/wrong-password")
                return res.status(403).json({ general: "Wrong credentials" });

            return res.status(500).json({ error: err.code });
        });
};

// Add User Details
export const addUserDetails = (req: Request, res: Response) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.username}`)
        .update(userDetails)
        .then(() => {
            return res.json({ message: "Details updated successfully" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Get Own User Details
export const getAuthenticatedUser = (req: Request, res: Response) => {
    let userData: any = {};

    db.doc(`/users/${req.user.username}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db
                    .collection("likes")
                    .where("username", "==", req.user.username)
                    .get();
            }
        })
        .then((data) => {
            userData.likes = [];
            data?.forEach((doc) => {
                userData.likes.push(doc.data());
            });
            return res.json(userData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Update a User Profile Image
export const uploadImage = (req: Request, res: Response) => {
    const busboy = new BusBoy({ headers: req.headers });
    let imageFileName: any;
    let imageToBeUploaded: any = {};

    busboy.on("file", (_, file, fileName, __, mimetype) => {
        if (mimetype !== "image/jpeg" && mimetype !== "image/png")
            return res.status(400).json({ error: "Invalid file type" });

        const imageExtension = fileName.split(".")[
            fileName.split(".").length - 1
        ];

        imageFileName = `${Math.round(
            Math.random() * 1000000000
        )}.${imageExtension}`;

        const filePath = path.join(os.tmpdir(), imageFileName);

        imageToBeUploaded = { filePath, mimetype };
        file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on("finish", () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filePath, {
                resumable: true,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db.doc(`/users/${req.user.username}`).update({
                    imageUrl
                });
            })
            .then(() => {
                return res.json({
                    message: "Image Uploaded Successfully"
                });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
    });

    busboy.end((req as any).rawBody);
};
