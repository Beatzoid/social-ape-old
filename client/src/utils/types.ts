export interface Scream {
    screamId: string;
    commentCount: number;
    userImage: string;
    createdAt: string;
    likeCount: string;
    userHandle: string;
    body: string;
}

export interface DecodedToken {
    aud: string;
    authTime: number;
    email: string;
    emailVeriified: boolean;
    exp: number;
    iat: number;
    iss: string;
    sub: string;
    userId: string;
}
