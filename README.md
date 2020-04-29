# horse-sales-online

To run this project, you must set up a .env file in the client/web directory. The env file stores two values for Firebase configuration.

```
REACT_APP_FIREBASE_APIKEY=apikey
REACT_APP_FIREBASE_APPID=appid
```

These values should be retrieved from the app's Firebase configuration in the Firebase console.

After your .env file is set up, simply cd to client/web and run `npm install` then `npm start`.

If you start the app before the .env file is in place, you must fully stop it and restart because the values will not propogate automatically.