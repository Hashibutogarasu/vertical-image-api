import { LoadingOverlay, Paper, ScrollArea } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";

const fileList = (files: FileWithPath[]): React.JSX.Element[] => (
    (files) ? files.map((file) => {
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
    }) : []
);

export default function FilesScrollList({ files, visible }: { files: FileWithPath[], visible: boolean }) {

    return <>
        {(files && !files.includes(undefined)) ? <Paper shadow="xs" p="xl">
            <ScrollArea h={400}>
                <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <ul>{fileList(files)}</ul>
            </ScrollArea>
        </Paper> : <></>}
    </>
}