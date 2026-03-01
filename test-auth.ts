import "dotenv/config";
import admin from "firebase-admin";
import { getApps, initializeApp } from "firebase-admin/app";

if (getApps().length === 0) {
    initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
}

async function test() {
    try {
        console.log("Project ID:", process.env.VITE_FIREBASE_PROJECT_ID);
        await admin.auth().verifyIdToken("invalid_token");
    } catch (err) {
        console.error("Error is:", err);
    }
}

test();
