import { DocumentSnapshot } from "firebase-admin/firestore";
import * as functions from "firebase-functions";


/**
 * The type of change that was made to the document.
 */
export enum ChangeType {
    CREATE,
    DELETE,
    UPDATE,
}


/**
 * Gets the type of change that was made to the document.
 * 
 * @param change the change object from the onWrite function
 * @returns the type of change that was made
 */
export const getChangeType = (change: functions.Change<DocumentSnapshot>): ChangeType => {
    if (!change.after.exists) {
        return ChangeType.DELETE;
    }
    if (!change.before.exists) {
        return ChangeType.CREATE;
    }
    return ChangeType.UPDATE;
};


