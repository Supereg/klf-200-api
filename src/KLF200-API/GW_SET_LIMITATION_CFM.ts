'use strict';

import { GW_FRAME_CFM, GW_INVERSE_STATUS } from "./common";

export class GW_SET_LIMITATION_CFM extends GW_FRAME_CFM {
    public readonly SessionID: number;
    public readonly Status: GW_INVERSE_STATUS;

    constructor(Data: Buffer) {
        super(Data);

        this.SessionID = this.Data.readUInt16BE(0);
        this.Status = this.Data.readUInt8(2);
    }
}
