import { FileWithPath } from "@mantine/dropzone";
import { FileInfo, VerticalAPIRequest } from "../types/verticalresponse";

async function cvtObjURLToImage(
    objURL: ReturnType<typeof URL.createObjectURL>
) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onerror = (e) => {
            console.error("failed to load image from objUrl");
            reject(e);
        };
        img.onload = () => {
            resolve(img);
        };
        img.src = objURL;
    });
}

function cvtHTMLImageElement2Canvas(
    img: HTMLImageElement,
    width: number,
    height: number,
) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("failed to getContext from canvas");
    }
    ctx.drawImage(img, 0, 0, width, height);
    return canvas
}

async function cvtDataURL2File(
    dataURL: string,
    filename: string
): Promise<File> {
    const blob = await (await fetch(dataURL)).blob();
    return new File([blob], filename);
}

function fileList(files: FileWithPath[]): React.JSX.Element[] {
    return (files) ? files.map((file) => {
        (async () => {
            const uint8Array = Array.from<number>(new Uint8Array(await file.arrayBuffer()));
            let encodedStr = '';

            for (let i = 0; i < uint8Array.length; i += 1024) {
                encodedStr += String.fromCharCode.apply(
                    null, uint8Array.slice(i, i + 1024)
                );
            }

            const base64 = window.btoa(encodedStr);
        });

        return (file) ? <li key={file.path}>
            {file.path} - {file.size} bytes
        </li> : <div key={undefined}></div>
    }) : [];
}

async function getfiles(body: string): Promise<{ data: FileInfo[], width: number }> {
    const json = JSON.parse(body) as VerticalAPIRequest;
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

        return {
            data: await files,
            width: width,
        };
    }
}

export {
    cvtObjURLToImage,
    cvtHTMLImageElement2Canvas,
    cvtDataURL2File,
    fileList,
    getfiles
}