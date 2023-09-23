import { LoadingOverlay, Paper, ScrollArea } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { fileList } from "./utils";

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