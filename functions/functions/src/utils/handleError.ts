import { Response } from "express";
import * as functions from "firebase-functions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleError = (err: any, res: Response) => {
    functions.logger.error(err.message);
    console.error(err);
    return res.status(500).json({
        error: err.code
    });
};
