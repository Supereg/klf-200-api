'use strict';

import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";

export class GW_SET_NODE_NAME_CFM extends GW_FRAME_CFM {
    public readonly Status: GW_COMMON_STATUS;
    public readonly NodeID: number;

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
        this.NodeID = this.Data.readUInt8(1);
    }
}
