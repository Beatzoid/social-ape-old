import { User } from "firebase/auth";

interface CustomUser extends User {
    handle: string;
}

declare global {
    namespace Express {
        interface Request {
            user: CustomUser;
        }
    }
}
