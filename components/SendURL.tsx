import { LoadingOverlay, ScrollArea, TextInput } from "@mantine/core";
import { useRef, useState } from "react";
import { Statics } from "./statics";

export default function SendURL({ visible }: { visible: boolean }) {
    const [host, sethost] = useState<string>("localhost");
    const [port, setport] = useState<number>(8080);
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
                (!Number.isNaN(value)) ? () => {
                    setport(value);
                    Statics.port = value;
                } : {};
            }} ref={portref} type="number" label="port" value={port} />
            <div > This image will be send to {`http://${host}:${port}/`}</div>
        </ScrollArea>
    </>
}