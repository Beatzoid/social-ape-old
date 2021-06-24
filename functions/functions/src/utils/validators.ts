const isEmpty = (string: string) => {
    if (string.trim() === "") return true;
    else return false;
};

const isEmail = (email: string) => {
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
    if (isEmpty(user.password)) errors.password = "Must not be empty";

    return errors;
};
