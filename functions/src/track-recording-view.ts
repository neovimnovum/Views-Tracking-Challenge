import * as functions from "firebase-functions";
import {Query, QuerySnapshot, QueryDocumentSnapshot} from "@google-cloud/firestore";
import {Recording} from "./types";
import {db} from "./index";

export async function trackRecordingView(viewerId: string, recordingId: string): Promise<void> {
  functions.logger.debug("viewerId: ", viewerId);
  functions.logger.debug("recordingId: ", recordingId);
  try {
    await db.runTransaction(async (t): Promise<void> => {
      const recordingQ: Query = db.collection("Recordings")
          .where("id", "==", recordingId);

      // First, query for whether the recording has already been seen by the viewer.
      // If nothing turns up, continue with the logic. If we get our recording, though,
      // there's nothing left to do.
      const seen: QuerySnapshot = await t.get(recordingQ
          .where("viewers", "array-contains", viewerId));

      if (seen.empty) {
        // Next, query for the unseen recording. If we don't find one, the recording
        // isn't in the db and we should throw a descriptive error.
        const unseen: QuerySnapshot<Recording> = await
          t.get(recordingQ) as QuerySnapshot<Recording>;
        if (unseen.empty) {
          throw new Error("Recording not found.");
        }

        // Otherwise, prepare and perform an update that increments viewers and adds user to
        // the viewers array (and initializes it if it doesn't exist).
        const unseenDocSnap: QueryDocumentSnapshot<Recording> = unseen.docs[0];
        const record: Recording = unseenDocSnap.data();
        const newViewers: string[] = Array.isArray(record.viewers) ? record.viewers : [];
        newViewers.push(viewerId);
        const newCount: number = record.uniqueViewCount + 1;
        await t.update(unseenDocSnap.ref, {uniqueViewCount: newCount, viewers: newViewers});
        return;
      }
    });
  } catch (e) {
    // As the app evolves, we would want custom error handling to
    // weed out common and expected errors. For now this is just a placeholder:
    functions.logger.error(e);
    throw e;
  }
}
