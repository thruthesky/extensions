import * as admin from "firebase-admin";
import * as test from "firebase-functions-test";
import { expect } from "chai";
import { describe } from "mocha";
import { mirrorFirestoreToDatabase } from "../src/mirror-firestore-to-database.function";
import { DataSnapshot } from "firebase-admin/database";
import { DocumentSnapshotOptions } from "firebase-functions-test/lib/providers/firestore";

import { initializeApp } from "firebase-admin/app";

/// Initialize Firebase only once for the testing suite.
if (admin.apps.length === 0) {
    initializeApp({
        databaseURL: "http://127.0.0.1:9000/?ns=withcenter-test-4"
    });
}



// Run test:
//
// ./node_modules/.bin/mocha --require=ts-node/register --watch --watch-files "tests/*.ts,src/**/*.ts" tests/test.spec.ts
describe('Mirror Firestore To Database: CREATE, UPDATE, DELETE TEST', () => {

    it('Create node and update, then check mirror, then delete, then check mirror', async () => {
        // Paths
        const collectionName = 'tmp';
        const documentId = 'id-2';
        const path = `${collectionName}/${documentId}`;
        const databasePath = 'tmp-mirrored';

        // Delete existing data for testing
        await admin.database().ref(databasePath).child(documentId).set(null);

        // Prepare variables
        const options: DocumentSnapshotOptions = {
            eventId: 'temp-event-id',
            auth: { uid: 'uid-a' },
            authType: 'USER', // only for realtime database functions
        } as DocumentSnapshotOptions;

        // Wrap the cloud function
        const wrapped = test().wrap(mirrorFirestoreToDatabase);

        // create at time value for testing
        const createdAt = new Date().getTime();



        // Test before the document is created.
        const notExistingSnapshot: DataSnapshot = await admin.database().ref(databasePath).child(documentId).get();
        expect(notExistingSnapshot.exists()).equal(false);

        // Create document. If the data is null, then the data is considered not existing.
        await wrapped(
            test().makeChange(
                test().firestore.makeDocumentSnapshot(null as any, path, options), // data not exist before.
                test().firestore.makeDocumentSnapshot({ createdAt }, path, options), // data exist after. So, it's a create operation.
            ),
        );

        // Test if the document is created.
        const createdSnapshot: DataSnapshot = await admin.database().ref(databasePath).child(documentId).get();
        expect(createdSnapshot.val()).to.deep.equal({ createdAt });

        // Update data
        await wrapped(
            test().makeChange(
                test().firestore.makeDocumentSnapshot({ createdAt } as any, path, options), // data not exist before.
                test().firestore.makeDocumentSnapshot({ createdAt, 're': 'updated' }, path, options), // data exist after. So, it's a create operation.
            ),
        );

        // Check if updated
        const updatedSnapshot: DataSnapshot = await admin.database().ref(databasePath).child(documentId).get();
        expect(updatedSnapshot.val().createdAt).to.deep.equal(createdAt);
        expect(updatedSnapshot.val().re).to.deep.equal('updated');

        // Delete data
        await wrapped(
            test().makeChange(
                test().firestore.makeDocumentSnapshot({ createdAt, 're': 'updated' } as any, path, options), // data not exist before.
                test().firestore.makeDocumentSnapshot(null as any, path, options), // data exist after. So, it's a create operation.
            ),
        );

        // Check if the document is deleted.
        const deletedSnapshot: DataSnapshot = await admin.database().ref(databasePath).child(documentId).get();
        expect(deletedSnapshot.exists()).equal(false);
    });

});
