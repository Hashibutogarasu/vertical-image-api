import { LoadingOverlay, ScrollArea, TextInput } from "@mantine/core";
import { useRef, useState } from "react";
import { Statics } from "./statics";
import { useLocalStorage } from "@mantine/hooks";

export default function SendURL({ visible }: { visible: boolean }) {
    const [host, sethost] = useLocalStorage({
        key: 'host',
        defaultValue: 'localhost',
    });
    const [port, setport] = useLocalStorage({
        key: 'port',
        defaultValue: 8080,
    });
    const hostref = useRef<HTMLInputElement>(null);
    const portref = useRef<HTMLInputElement>(null);

    Statics.host = "localhost";
    Statics.port = 8080;

    return <>
        <ScrollArea>
            <LoadingOverlay visible={visible} zIndex={999} overlayProps={{ radius: "sm", blur: 2 }} />
            <TextInput ref={hostref} onChange={() => {
                sethost(hostref.current.value);
                Statics.host = hostref.current.value;
            }} type="url" label="host" value={host} />
            <TextInput onChange={() => {
                const value = Number.parseInt(portref.current.value);
                setport(value);
                Statics.port = value;
            }} ref={portref} type="number" label="port" value={port} />
            <div > This image will be send to {`http://${host}:${port}/`}</div>
        </ScrollArea>
    </>
}