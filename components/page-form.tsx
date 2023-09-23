import { useRef, useState } from 'react';
import { Button, Center, Code, CopyButton, Group, Modal, Paper, Space, Stack, Text } from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { VerticalAPIErrorResponse, VerticalAPIRequest, VerticalAPIResponse } from '../types/verticalresponse';
import path from 'path';
import imageInfo from "base64image-dimensions";
import SendURL from './SendURL';
import FilesScrollList from './filesScrollList';

export default function PageForm() {
    const openRef = useRef<() => void>(null);
    const [files, setfiles] = useState<FileWithPath[]>(undefined);
    const [loading, setloading] = useState<boolean>(false);

    const [image, setimage] = useState<VerticalAPIResponse>(undefined);
    const [jsondata, setjsondata] = useState<VerticalAPIRequest>(undefined);

    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState<VerticalAPIResponse>(undefined);
    const [apistatus, setapiStatus] = useState<number>(undefined);
    const [error, seterror] = useState<VerticalAPIErrorResponse>({
        message: 'none',
        status: 204,
    })
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <Center>
            <Stack>
                <Stack>
                    <Paper shadow="xs" p="xl">
                        <Space h={2} />
                        <div style={{
                            width: 500
                        }}>
                            {!(loading) ? <Dropzone openRef={openRef} onDrop={async (values) => {
                                const mappedfiles = values.map((value) => {
                                    const ext = path.extname(value.path);
                                    if (ext === '.png') {
                                        return value;
                                    }
                                });

                                const pngfiles = [];

                                mappedfiles.forEach((mappedfile) => {
                                    if (mappedfile != undefined) {
                                        pngfiles.push(mappedfile);
                                    }
                                });

                                setfiles(pngfiles);

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

                                setjsondata(json);
                            }}>
                                <Paper shadow="xs" p="xl">
                                    Drag images here or click to select files
                                    <br />
                                    (supported only <strong>png</strong> files)
                                </Paper>
                            </Dropzone> : <></>}
                        </div>

                        <SendURL visible={loading} />
                        <FilesScrollList files={files} visible={loading} />
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
                        setfiles(undefined);
                        setjsondata(undefined);
                    }}>Clear files</Button>

                    <Button data-disabled={loading} color='blue' onClick={() => openRef.current?.()}>Select files</Button>

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