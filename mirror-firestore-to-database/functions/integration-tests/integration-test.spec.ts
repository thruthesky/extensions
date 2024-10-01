import * as admin from "firebase-admin";
import { expect } from "chai";
import { describe } from "mocha";


import { initializeApp } from "firebase-admin/app";

/// Initialize Firebase only once for the testing suite.
if (admin.apps.length === 0) {
  initializeApp({
    databaseURL: "http://127.0.0.1:9000/?ns=demo-test"
  });
}

// Run test:
//
// ./node_modules/.bin/mocha --require=ts-node/register --watch --watch-files "tests/*.ts,src/**/*.ts" tests/test.spec.ts
describe('Mirror Firestore To Database: CREATE, UPDATE, DELETE TEST', () => {

  it('Create test', async () => {
    const collectionName = 'abc';
    const databasePath = 'def/ghi';
    const documentId = 'id-1';
    await admin.firestore().collection(collectionName).doc(documentId).set({ name: 'a', createdAt: new Date().getTime() });
    const createdSnapshot = await admin.firestore().collection(collectionName).doc(documentId).get();

    console.log('createdSnapshot: ', createdSnapshot.data());
    expect(createdSnapshot.exists).equal(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const snapshot = await admin.database().ref().child(databasePath).child(documentId).get();

    console.log('snapshot: ', snapshot.val());

    expect(snapshot.exists()).equal(true);
    expect(snapshot.val()).to.deep.equal({ name: 'a', createdAt: createdSnapshot.data()!.createdAt });
  });


});
