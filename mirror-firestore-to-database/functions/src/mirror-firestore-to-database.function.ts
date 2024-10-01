import * as functions from "firebase-functions";


import {
  DocumentSnapshot,
  WriteResult,
} from "firebase-admin/firestore";
import { ChangeType, getChangeType } from "./library";
import { getDatabase } from "firebase-admin/database";
import { Config } from "./config";


/**
 * Mirror Firestore to Database
 */
console.log("-- Config", Config.json());
export const mirrorFirestoreToDatabase = functions.firestore.document(Config.collection + "/{documentId}")
  .onWrite(async (change: functions.Change<DocumentSnapshot>): Promise<WriteResult | void | null> => {
    switch (getChangeType(change)) {
      case ChangeType.CREATE:
      case ChangeType.UPDATE:
        console.log("SYNC: ", getChangeType(change), change.after.data());
        await getDatabase().ref(Config.databasePath).child(change.after.id).set(change.after.data());
        break;
      case ChangeType.DELETE:
        console.log("DELETE", change.before.data(), change.after.data());
        await getDatabase().ref(Config.databasePath).child(change.after.id).set(null);
        break;
    }
    return;
  });


