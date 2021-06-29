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
    DocumentData,
    orderBy,
    limit,
    writeBatch,
    deleteDoc
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
        .catch((err) => {
            if (err.code === "auth/email-already-in-use") {
                return res
                    .status(400)
                    .json({ email: "Email is already is use" });
            } else if (err.code === "auth/weak-password") {
                return res
                    .status(400)
                    .json({
                        password:
                            "Password length must be greater than six characters"
                    });
            } else {
                functions.logger.error(err.message);
                console.error(err);
                return res.status(500).json({
                    general: "Something went wrong, please try again"
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
            if (
                err.code === "auth/wrong-password" ||
                err.code === "auth/user-not-found"
            ) {
                return res
                    .status(403)
                    .json({ general: "Wrong credentials, please try again" });
            } else {
                functions.logger.error(err.message);
                console.error(err);
                return res.status(500).json({
                    general: "Something went wrong, please try again later"
                });
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

export const getAuthenticatedUser = async (req: Request, res: Response) => {
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
                    (userData.likes as DocumentData[]).push(like.data());
                });

                const notifications = await getDocs(
                    query(
                        collection(db, "notifications"),
                        where("recipient", "==", req.user.handle),
                        orderBy("createdAt", "desc"),
                        limit(10)
                    )
                );

                userData.notifications = [];

                notifications.forEach((notification) => {
                    (userData.notifications as DocumentData[]).push({
                        ...notification.data(),
                        notificationId: doc.id
                    });
                });

                return res.json(userData);
            } else return;
        })
        .catch((err) => handleError(err, res));
};

export const getUser = async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userData: any = {};

    getDoc(doc(db, `/users/${req.params.handle}`))
        .then(async (userDoc) => {
            if (!userDoc.exists())
                return res.status(404).json({ error: "User not found" });

            userData.user = userDoc.data();
            const screams = await getDocs(
                query(
                    collection(db, "screams"),
                    where("userHandle", "==", req.params.handle),
                    orderBy("createdAt", "desc")
                )
            );
            userData.screams = [];
            screams.forEach((scream) => {
                userData.screams.push({
                    ...scream.data(),
                    screamId: scream.id
                });
            });
            return res.json(userData);
        })
        .catch((err) => handleError(err, res));
};

export const markNotificatonsRead = async (req: Request, res: Response) => {
    const batch = writeBatch(db);
    req.body.forEach((notificationId: string) => {
        batch.update(doc(db, `/notifications/${notificationId}`), {
            read: true
        });
    });

    batch
        .commit()
        .then(() =>
            res.json({ message: "Successfully marked notifications as read" })
        )
        .catch((err) => handleError(err, res));
};

export const createNotification = async (
    snapshot: functions.firestore.QueryDocumentSnapshot,
    type: "comment" | "like"
) => {
    const screamDoc = doc(db, `/screams/${snapshot.data().screamId}`);

    getDoc(screamDoc)
        .then(async (scream) => {
            // If the person who liked the scream isn't the poster/owner of the scream
            if (scream.data()?.userHandle !== snapshot.data().userHandle) {
                return setDoc(doc(db, `/notifications/${snapshot.id}`), {
                    createdAt: new Date().toISOString(),
                    recipient: scream.data()?.userHandle,
                    sender: snapshot.data().userHandle,
                    type,
                    read: false,
                    screamId: scream.id
                });
            }
        })
        .catch((err) => {
            functions.logger.error(err.message);
            console.error(err);
        });
};

export const deleteNotification = async (
    snapshot: functions.firestore.QueryDocumentSnapshot
) => {
    deleteDoc(doc(db, `/notifications/${snapshot.id}`)).catch((err) => {
        functions.logger.error(err.message);
        console.error(err);
    });
};

export const onUserImageChange = async (
    change: functions.Change<functions.firestore.QueryDocumentSnapshot>
) => {
    // Execute only if the user has changed their image
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
        const batch = writeBatch(db);

        // Get all the screams the user has created
        getDocs(
            query(
                collection(db, "screams"),
                where("userHandle", "==", change.before.data().handle)
            )
        ).then((screams) => {
            screams.forEach((scream) => {
                const screamDoc = doc(db, `/screams/${scream.id}`);
                batch.update(screamDoc, {
                    userImage: change.after.data().imageUrl
                });
            });
            return batch.commit();
        });
    }
};
