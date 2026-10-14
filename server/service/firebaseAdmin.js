const { initializeApp, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const getFirebaseAuth = () => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
        throw new Error("FIREBASE_PROJECT_ID is not configured");
    }

    const app = getApps().find((firebaseApp) => firebaseApp.name === "flipkart-auth") || initializeApp(
        { projectId },
        "flipkart-auth"
    );
    return getAuth(app);
};

const verifyFirebaseIdToken = async (idToken) => {
    return getFirebaseAuth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseIdToken };
