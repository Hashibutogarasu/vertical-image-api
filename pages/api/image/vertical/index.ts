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
                const json = JSON.stringify(file);
                const data = fetch(`http://${Statics.host}:${Statics.port}/?width=${width}`, {
                    method: 'POST',
                    body: json,
                    headers: {
                        width: width.toString()
                    }
                });
                const result = JSON.parse(await (await data).text()) as VerticalAPIResponse;
                res.status(200).json(result);
            }).catch((error) => {
                res.status(500).json({
                    message: error.message,
                    status: 500,
                });
            });
        }
    }
    else {
        res.status(204).json({
            status: 204,
            message: 'failed to generate image',
        });
        res.end();
    }
}