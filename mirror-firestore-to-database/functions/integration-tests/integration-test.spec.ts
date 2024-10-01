import * as admin from "firebase-admin";
import * as test from "firebase-functions-test";
import { expect } from "chai";
import { describe } from "mocha";

import { mirrorFirestoreToDatabase } from "../src/index";
import { CallableContextOptions } from "firebase-functions-test/lib/v1";
import { DataSnapshot } from "firebase-admin/database";



const uid = 'test-uid';

describe('mirrorDatabaseToFirestore', () => {

  it('Create node and update, then check mirror, then delete, then check mirror', async () => {
    const path = 'tests/id-2';
    // prepare variables
    const documentSnapshot = test().firestore.makeDocumentSnapshot({ _data: true }, path);
    const options = {
      eventId: 'temp-event-id',
      createdAt: new Date().getTime().toString(),
      auth: { uid },
      authType: 'USER', // only for realtime database functions
    } as CallableContextOptions;

    // wrap the function
    const wrapped = test().wrap(mirrorFirestoreToDatabase);

    // create data
    await wrapped(
      test().makeChange(
        documentSnapshot(null, path), // data not exist before
        documentSnapshot(false, path), // data exist after. So, it's a create operation.
      ),
      options
    );

    const snapshotGot: DataSnapshot = await admin.database().ref('mirror-to').child('id-2').get();
    expect(snapshotGot.val()).to.deep.equal({ _data: false });

    // 데이터 수정
    const input2 = { a: 'apple', "b": 2 };
    await wrapped(
      test().makeChange(
        documentSnapshot(true, path), // 실행 전 데이터 존재 함!!
        documentSnapshot(input2, path), // 실행 후에도 데이터 존재!!
      ),
      options
    );

    const snapshotGot2 = await admin.firestore().collection('mirror-to').doc('id-2').get();
    const data2 = snapshotGot2.data();
    expect(data2).to.deep.equal(input2);

    // 데이터 삭제
    await wrapped(
      test().makeChange(
        documentSnapshot(0, path), // 실행 전 데이터 존재 함!!
        documentSnapshot(null, path), // 실행 후에도 데이터 존재 안 함!!
      ),
      options
    );
    const snapshotGot3 = await admin.firestore().collection('mirror-to').doc('id-2').get();
    const data3 = snapshotGot3.data();
    expect(data3).to.be.undefined;
  });

});
