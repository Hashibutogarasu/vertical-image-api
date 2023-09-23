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

export {
    cvtObjURLToImage,
    cvtHTMLImageElement2Canvas,
    cvtDataURL2File,
}