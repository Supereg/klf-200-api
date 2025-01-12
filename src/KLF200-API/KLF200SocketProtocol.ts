"use strict";

import { IGW_FRAME_RCV, SLIP_END, SLIPProtocol, KLF200Protocol } from "./common";
import { Socket } from "net";
import { TypedEvent, Listener, Disposable } from "../utils/TypedEvent";
import { FrameRcvFactory } from "./FrameRcvFactory";

export type FrameReceivedHandler = (frame: IGW_FRAME_RCV) => void;

enum KLF200SocketProtocolState {
    Invalid,
    StartFound
}

export class KLF200SocketProtocol {
    private _onFrameReceived = new TypedEvent<IGW_FRAME_RCV>();
    private _onDataSent = new TypedEvent<Buffer>();
    private _onDataReceived = new TypedEvent<Buffer>();
    private _onError = new TypedEvent<Error>();
    
    private state: KLF200SocketProtocolState = KLF200SocketProtocolState.Invalid;
    private queue: Buffer[] = [];

    constructor(readonly socket: Socket) {
        socket.on("data", (data) => this.processData(data));
        socket.on("close", (had_error) => this.onSocketClose(had_error));
    }

    private processData(data: Buffer): void {
        switch (this.state) {
            case KLF200SocketProtocolState.Invalid:
                // Find first END mark
                const positionStart = data.indexOf(SLIP_END);
                if (positionStart === -1)   // No start found -> ignore complete buffer
                    return;

                this.state = KLF200SocketProtocolState.StartFound;
                this.queue.push(data.slice(positionStart, positionStart + 1));

                // Process remaining data
                if (positionStart + 1 < data.byteLength)
                    this.processData(data.slice(positionStart + 1));

                break;

            case KLF200SocketProtocolState.StartFound:
                // Find END mark
                const positionEnd = data.indexOf(SLIP_END);
                if (positionEnd === -1) {     // No end found -> take complete buffer
                    this.queue.push(data);
                    return;
                }

                this.state = KLF200SocketProtocolState.Invalid;
                this.queue.push(data.slice(0, positionEnd + 1));
                const frameBuffer = Buffer.concat(this.queue);

                // Clear queue and process remaining data, if any
                this.queue = [];
                this.send(frameBuffer);

                if (positionEnd + 1 < data.byteLength)
                    this.processData(data.slice(positionEnd + 1));

                break;
        
            default:
                break;
        }
    }

    private onSocketClose(had_error: boolean): void {
    }

    on(handler: Listener<IGW_FRAME_RCV>): Disposable {
        return this._onFrameReceived.on(handler);
    }

    off(handler: Listener<IGW_FRAME_RCV>): void {
        this._onFrameReceived.off(handler);
    }

    once(handler: Listener<IGW_FRAME_RCV>): void {
        this._onFrameReceived.once(handler);
    }

    onDataSent(handler: Listener<Buffer>): Disposable {
        return this._onDataSent.on(handler);
    }

    onDataReceived(handler: Listener<Buffer>): Disposable {
        return this._onDataReceived.on(handler);
    }

    offDataSent(handler: Listener<Buffer>): void {
        this._onDataSent.off(handler);
    }

    offDataReceived(handler: Listener<Buffer>): void {
        this._onDataReceived.off(handler);
    }

    onError(handler: Listener<Error>): void {
        this._onError.on(handler);
    }

    offError(handler: Listener<Error>): void {
        this._onError.off(handler);
    }

    async send(data: Buffer): Promise<void> {
        try {
            this._onDataReceived.emit(data);
            const frameBuffer = KLF200Protocol.Decode(SLIPProtocol.Decode(data));
            const frame = await FrameRcvFactory.CreateRcvFrame(frameBuffer);
            this._onFrameReceived.emit(frame);
            return Promise.resolve();
        } catch (e) {
            this._onError.emit(e as Error);
            return Promise.resolve();
        }
    }

    write(data: Buffer): boolean {
        this._onDataSent.emit(data);
        const slipBuffer = SLIPProtocol.Encode(KLF200Protocol.Encode(data));
        return this.socket.write(slipBuffer);
    }
}