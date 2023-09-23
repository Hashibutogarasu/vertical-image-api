import { NextApiRequest } from "next";

export interface NextApiImageRequest extends NextApiRequest {
    id: number,
    body: {
        width: number,
        fileslength: number,
        files: string[],
    }
}
