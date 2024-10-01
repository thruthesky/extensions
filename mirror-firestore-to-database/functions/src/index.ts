import * as functions from "firebase-functions";


import { initializeApp } from "firebase-admin/app";


import {
  DocumentSnapshot,
  WriteResult,
} from "firebase-admin/firestore";
import { Config } from "./config";
import { ChangeType, getChangeType } from "./library";
import { getDatabase } from "firebase-admin/database";

initializeApp({
  databaseURL: "http://127.0.0.1:9000/?ns=withcenter-test-4"
});



/**
 * Mirror Firestore to Database
 */
export const mirrorFirestoreToDatabase = functions.firestore.document(Config.collection + "/{documentId}")
  .onWrite(async (change: functions.Change<DocumentSnapshot>): Promise<WriteResult | void | null> => {

    switch (getChangeType(change)) {
      case ChangeType.CREATE:
      case ChangeType.UPDATE:
        Config.log("SYNC", change.after.data());
        await getDatabase().ref(Config.databasePath).child(change.after.id).set(change.after.data());
        break;
      case ChangeType.DELETE:
        Config.log("DELETE", change.before.data());
        await change.before.ref.delete();
        break;
    }
    return;
  });

