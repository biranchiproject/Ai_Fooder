import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express, { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import admin from "firebase-admin";
import { getApps, initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin (using local env or default credentials)
if (getApps().length === 0) {
    initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
}

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "zomato-secret-key",
        resave: false,
        saveUninitialized: false,
        store: storage.sessionStore,
        cookie: {
            secure: app.get("env") === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                if (!user || !(await comparePasswords(password, user.password))) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }),
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/register", async (req, res, next) => {
        try {
            const { username, password, email, mobile } = req.body;

            if (!username || !password || !email || !mobile) {
                return res.status(400).json({ message: "All fields are mandatory" });
            }

            const existingUser = await storage.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            const hashedPassword = await hashPassword(password);
            const user = await storage.createUser({
                uid: username, // Fallback for local
                username,
                password: hashedPassword,
                email,
                mobile,
            });

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ message: "Invalid credentials" });
            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        })(req, res, next);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });

    app.post("/api/user/profile", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const { fullName, mobile, address } = req.body;
        try {
            const updatedUser = await storage.updateUser(req.user!.id, {
                fullName,
                mobile,
                address,
                isProfileComplete: true
            });
            res.json(updatedUser);
        } catch (err) {
            res.status(500).json({ message: "Failed to update profile" });
        }
    });

    app.post("/api/auth/firebase", async (req, res, next) => {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ message: "Firebase ID token is required" });
            }

            const decodedToken = await admin.auth().verifyIdToken(token);
            const { uid, email, name, picture } = decodedToken;

            if (!email) {
                return res.status(400).json({ message: "Email is required from Google" });
            }

            // Try to find user by uid
            let user = await storage.getUserByUid(uid);

            if (!user) {
                // Create new user for this account
                user = await storage.createUser({
                    uid,
                    username: email,
                    email,
                    password: "google-managed",
                    fullName: name || "",
                    photoURL: picture || "",
                    role: "user",
                    isProfileComplete: false,
                    mobile: "",
                    address: "",
                });
            }

            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        } catch (err) {
            console.error("Firebase Auth Error:", err);
            res.status(401).json({ message: "Authentication failed" });
        }
    });
}
