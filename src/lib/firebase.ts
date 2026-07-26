import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let isFirebaseEnabled = false;
let app;
let auth: any = null;
let db: any = null;

const isPlaceholder = !firebaseConfig.apiKey || 
                      firebaseConfig.apiKey.includes('placeholder') || 
                      firebaseConfig.apiKey === 'dummy-api-key';

if (!isPlaceholder) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId || '(default)');
    isFirebaseEnabled = true;

    // Test connection asynchronously
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firebase test connection warning: the client is offline.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.warn("Firebase failed to initialize. Mode swapped to Local offline storage:", err);
  }
} else {
  console.log("Using placeholder firebase config. Mode swapped to Local offline storage.");
}

export { isFirebaseEnabled, auth, db, app };
