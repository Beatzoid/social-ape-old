export const isEmpty = (string: String) => string.trim() === "";
export const isEmail = (email: String) =>
    email.match(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

export const reduceUserDetails = (data: any) => {
    let userDetails: any = {
        bio: "",
        website: "",
        location: ""
    };

    if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if (!isEmpty(data.website.trim())) {
        if (
            data.website.trim().substring(0, 4) !== "http" &&
            data.website.trim().substring(0, 5) !== "https"
        ) {
            // This uses http and not https because some websites don't support https
            // and will crash/not load if you try to use https
            userDetails.website = `http://${data.website.trim()}`;
        } else userDetails.website = data.website;
    }
    if (!isEmpty(data.location.trim())) userDetails.location = data.location;

    return userDetails;
};
