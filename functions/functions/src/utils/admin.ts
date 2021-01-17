import * as fbAdmin from "firebase-admin";
export const admin = fbAdmin.initializeApp();
export const db = admin.firestore();
