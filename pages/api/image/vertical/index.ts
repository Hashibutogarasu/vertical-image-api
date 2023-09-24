import type { NextApiRequest, NextApiResponse } from 'next'
import { FileInfo, VerticalAPIErrorResponse, VerticalAPIRequest, VerticalAPIResponse } from '../../../../types/verticalresponse';
import * as fs from 'fs'
import { Statics } from '../../../../components/statics';


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<VerticalAPIResponse | VerticalAPIErrorResponse>
) {
    if (req.body) {
        const json = JSON.parse(req.body) as VerticalAPIRequest;
        const width = json.width;
        const data = json.data;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'max-age=180000');

        if (data) {
            const files = Promise.all(data.map(async (value) => {
                const fileData = value.data.replace(/^data:\w+\/\w+;base64,/, '');
                const decodedFile = Buffer.from(fileData, 'base64');
                const fileExtension = value.data.toString().slice(value.data.indexOf('/') + 1, value.data.indexOf(';'));
                const contentType = value.data.toString().slice(value.data.indexOf(':') + 1, value.data.indexOf(';'));

                return {
                    rawdata: value.data,
                    decodedFile: decodedFile.toString("base64"),
                    fileExtension: fileExtension,
                    contentType: contentType,
                    fileData: fileData,
                } as FileInfo
            }));

            files.then(async (file) => {
                const data = await fetch(`http://${Statics.host}:${Statics.port}/`, {
                    method: 'POST',
                    body: JSON.stringify({
                        data: file,
                        width: width,
                    }),
                });

                const text = await data.text();

                const result = JSON.parse(text) as VerticalAPIResponse;

                res.status(200);
                res.json(result);
                res.end();

                return;
            }).catch((error) => {
                res.status(500);
                res.end({
                    status: 500,
                    message: error.message,
                });
            });

            return;
        }
    }
    else {
        res.statusCode = 204;
        res.end({
            status: 204,
            message: "failed to generate image",
        });
    }

}