import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

export const incrementPostView = functions.https.onCall(async (dataOrRequest, context) => {
  // 1. SAFE DATA EXTRACTION (Handles Gen 1 vs Gen 2 differences)
  // In Gen 2, 'data' is nested inside the first argument. In Gen 1, it IS the first argument.
  const actualData = dataOrRequest.data ? dataOrRequest.data : dataOrRequest;
  
  console.log("📥 Raw Input:", dataOrRequest);
  console.log("📂 Extracted Data:", actualData);

  const postId = actualData.postId;

  // 2. Validation
  if (!postId) {
    console.error("❌ Error: postId missing. Received:", actualData);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'postId'."
    );
  }

  // 3. Database Update
  const postRef = admin.firestore().collection("posts").doc(postId);

  try {
    await postRef.update({
      views: admin.firestore.FieldValue.increment(1),
    });
    console.log(`✅ Incremented views for: ${postId}`);
    return { success: true, postId };
  } catch (error) {
    console.error("❌ Firestore Update Failed:", error);
    throw new functions.https.HttpsError("internal", "Failed to update view count.");
  }
});