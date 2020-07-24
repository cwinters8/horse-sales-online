import firebaseMock from 'firebase-mock';

const mockAuth = new firebaseMock.MockAuthentication();
const mockFirestore = new firebaseMock.MockFirestore();
const mockStorage = new firebaseMock.MockStorage();
const mockSdk = new firebaseMock.MockFirebaseSdk(
  null, // Realtime Database
  () => mockAuth, // Auth
  () => mockFirestore, // Firestore
  () => mockStorage, // Storage
  null // Messaging
);

export default mockSdk;