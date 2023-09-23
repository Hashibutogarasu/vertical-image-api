export type VerticalAPIRequest = {
    data: Array<{ name: string; data: string; }>
    length: number,
    width: number
}

export type VerticalAPIResponse = {
    width: number
    height: number
    data: string
    ext: string
}

export type VerticalAPIErrorResponse = {
    status: number
    message: string
}


export type FileInfo = {
    rawdata: string
    fileData: string
    decodedFile: string
    fileExtension: string
    contentType: string
}