const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function deleteUnmatchedGames() {
  console.log('한국어 미매칭 게임 조회 중...');
  const snapshot = await db.collection('games').get();
  
  let deleteCount = 0;
  const deletePromises = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    // 영문명과 한글명이 같거나, 보드라이프 ID가 없는 경우 미매칭으로 간주
    if (data.name === data.englishName || !data.boardlifeId) {
      console.log(`삭제 대상 발견: ${data.name} (${doc.id})`);
      deletePromises.push(db.collection('games').doc(doc.id).delete());
      deleteCount++;
    }
  });

  if (deletePromises.length > 0) {
    await Promise.all(deletePromises);
    console.log(`총 ${deleteCount}개의 게임을 삭제했습니다.`);
  } else {
    console.log('삭제할 게임이 없습니다.');
  }
}

deleteUnmatchedGames().catch(console.error);
