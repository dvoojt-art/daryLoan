const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Creates a new user in Firebase Authentication and a corresponding
 * user document in Firestore.
 *
 * This function can only be called by an authenticated user who is an admin.
 */
exports.createNewMember = functions.https.onCall(async (data, context) => {
  // 1. Check for admin privileges.
  if (!context.auth || context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an admin to create new members.",
    );
  }

  // 2. Validate incoming data.
  const { email, password, name, shares, contributions } = data;
  if (!email || !password || !name) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: email, password, and name.",
    );
  }

  try {
    // 3. Create the user in Firebase Authentication.
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // 4. Create the user document in Firestore.
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      name: name,
      email: email,
      role: "member",
      totalContributions: parseFloat(contributions) || 0,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      shares: parseFloat(shares) || 0,
      profit: 0,
    });

    return { result: `Successfully created ${name} (${email})` };
  } catch (error) {
    // If user creation fails (e.g., email already exists), re-throw the error.
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});