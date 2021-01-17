// This is to prevent the firebase app from getting
// initialized more than once, which causes an error
import firebase from "firebase";
import config from "../utils/config";
export default firebase.initializeApp(config);
