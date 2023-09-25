import { useRef, useState } from 'react';
import { Button, Center, Code, CopyButton, Group, LoadingOverlay, Modal, Paper, ScrollArea, Space, Stack, Text } from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { VerticalAPIErrorResponse, VerticalAPIRequest, VerticalAPIResponse } from '../types/verticalresponse';
import path from 'path';
import imageInfo from "base64image-dimensions";
import SendURL from './SendURL';
import { fileList } from './utils';

export default function PageForm() {
    const openRef = useRef<() => void>(null);
    const [pngfiles, setpngfiles] = useState<FileWithPath[]>([]);
    const [files, setfiles] = useState<FileWithPath[]>(undefined);
    const [loading, setloading] = useState<boolean>(false);

    const [image, setimage] = useState<VerticalAPIResponse>(undefined);
    const [jsondata, setjsondata] = useState<VerticalAPIRequest>(undefined);

    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState<VerticalAPIResponse>(undefined);
    const [apistatus, setapiStatus] = useState<number>(undefined);
    const [isadd, setadd] = useState<boolean>(false);
    const [error, seterror] = useState<VerticalAPIErrorResponse>({
        message: 'none',
        status: 204,
    })
    const [opened, { open, close }] = useDisclosure(false);

    async function onfilesdrop(files: FileWithPath[], current: FileWithPath[], add: boolean) {
        const mappedfiles = files.map((value) => {
            const ext = path.extname(value.path);
            if (ext === '.png') {
                return value;
            }
        });

        mappedfiles.forEach((mappedfile) => {
            if (mappedfile != undefined) {
                pngfiles.push(mappedfile);
            }
        });

        const images = await Promise.all(pngfiles.map(async (file) => {
            if (file) {
                const uint8Array = Array.from<number>(new Uint8Array(await file.arrayBuffer()));
                let encodedStr = '';

                for (let i = 0; i < uint8Array.length; i += 1024) {
                    encodedStr += String.fromCharCode.apply(
                        null, uint8Array.slice(i, i + 1024)
                    );
                }

                const base64 = window.btoa(encodedStr);

                let info = imageInfo(base64);

                return {
                    name: file.name,
                    data: `data:image/png;base64,${base64}`,
                    width: info.width
                };
            }
        }));

        const json: VerticalAPIRequest = {
            data: images,
            length: images?.length,
            width: images[0]?.width ?? 16,
        };

        setfiles(pngfiles);
        setjsondata(json);
    }

    return (
        <Center>
            <Stack>
                <Stack>
                    <Paper shadow="xs" p="xl">
                        <Space h={2} />
                        <div style={{
                            width: 500
                        }}>
                            {!(loading) ? <Dropzone openRef={openRef} onDrop={(value) => {
                                onfilesdrop(value, files, isadd);
                            }}>
                                <Paper shadow="xs" p="xl">
                                    Drag images here or click to add files
                                    <br />
                                    (supported only <strong>png</strong> files)
                                </Paper>
                            </Dropzone> : <></>}
                        </div>

                        <SendURL visible={loading} />
                        {((files && !files.includes(undefined)) || (pngfiles.length != 0 && !pngfiles.includes(undefined))) ? <Paper shadow="xs" p="xl">
                            <ScrollArea h={300}>
                                <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                                <ul>{fileList(files)}</ul>
                            </ScrollArea>
                        </Paper> : <></>}
                    </Paper>
                </Stack>
                <Group justify="right" mt="md">
                    <CopyButton value={JSON.stringify(jsondata)}>
                        {({ copied, copy }) => (
                            <Button data-disabled={loading || jsondata == undefined} color={copied ? 'teal' : 'indigo'} onClick={(copied || jsondata != undefined) ? copy : undefined}>
                                {copied && jsondata != undefined ? 'Copied data' : 'Copy data'}
                            </Button>
                        )}
                    </CopyButton>

                    <Button data-disabled={(loading || (files == undefined || files.includes(undefined)))} color='red' onClick={() => {
                        setpngfiles([]);
                        setfiles(undefined);
                        setjsondata(undefined);
                    }}>Clear files</Button>

                    <Button data-disabled={loading} color='blue' onClick={() => {
                        setadd(true);
                        openRef.current?.();
                    }}>Add files</Button>

                    <Button color='green' data-disabled={(loading || (files == undefined || files.includes(undefined)))} onClick={(!loading && files) ? () => {
                        setloading(true);
                        setVisible(false);

                        (async () => {
                            const res = await fetch(
                                '/api/image/vertical',
                                {
                                    method: 'POST',
                                    body: JSON.stringify(jsondata),
                                }
                            );

                            if (res.status == 200) {
                                const text = await new Response(res.body).text();
                                const data = JSON.parse(text);
                                setimage(data);
                                open();
                                setapiStatus(res.status);
                                setStatus(data);
                                seterror(data);
                                setloading(false);
                            }
                            else {

                            }
                        })();
                    } : undefined}>Generate</Button>
                </Group>

                <Modal opened={apistatus == 200 && opened} onClose={close}>
                    <Paper>
                        <Stack>
                            {(image) ? <>
                                <Code>
                                    {image.data}
                                </Code>
                                <CopyButton value={image.data}>
                                    {({ copied, copy }) => (
                                        <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                                            {copied ? 'Copied data' : 'Copy data'}
                                        </Button>
                                    )}
                                </CopyButton>
                                <Paper shadow="xs" p="xl">
                                    <Stack style={{
                                        padding: 10,
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: 5,
                                    }}>
                                        <strong>Result:</strong>
                                        <img src={`data:image/png;base64,${image.data}`} width={image.width} height={image.height} alt='' />
                                    </Stack>
                                </Paper>
                            </> : <></>}
                        </Stack>
                    </Paper>
                </Modal>

                <Modal opened={apistatus != 200 && opened} onClose={close}>
                    <Paper>
                        <Stack>
                            <h1>Request URL</h1>
                            {`http://${process.argv[1]}:${process.argv[2]}/`}
                            <h2>Status:</h2><br />
                            {error?.status}
                            <h3>Message:<br /></h3><br />
                            {error?.message}
                        </Stack>
                    </Paper>
                </Modal>
            </Stack>
        </Center >
    );
}