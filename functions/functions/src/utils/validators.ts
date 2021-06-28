import { UserDetails } from "../types/interfaces";

export const isEmpty = (string: string) => {
    if (string.trim() === "") return true;
    else return false;
};

export const isEmail = (email: string) => {
    const emailRegex =
        // eslint-disable-next-line max-len
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (email.match(emailRegex)) return true;
    else return false;
};

export const validateSignup = (newUser: Record<string, string>) => {
    const errors: Record<string, string> = {};

    if (isEmpty(newUser.email)) errors.email = "Must not be empty ";
    else if (!isEmail(newUser.email))
        errors.email = "Must be a valid email address";

    if (isEmpty(newUser.password)) errors.password = "Must not be empty";
    if (newUser.password !== newUser.confirmPassword)
        errors.confirmPassword = "Passwords must match";

    if (isEmpty(newUser.handle)) errors.handle = "Must not be empty ";

    return errors;
};

export const validateLogin = (user: Record<string, string>) => {
    const errors: Record<string, string> = {};

    if (isEmpty(user.email)) errors.email = "Must not be empty";
    if (!isEmail(user.email)) errors.email = "Must be a valid email address";
    if (isEmpty(user.password)) errors.password = "Must not be empty";

    return errors;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reduceUserDetails = (data: UserDetails) => {
    const userDetails: Record<string, string> = {};

    userDetails.bio = data.bio;

    // https://website.com -> good
    // website.com -> http://website.com
    if (data.website.trim().substring(0, 4) !== "http")
        userDetails.website = `http://${data.website}`;
    else userDetails.website = data.website;

    userDetails.location = data.location;

    return userDetails;
};
