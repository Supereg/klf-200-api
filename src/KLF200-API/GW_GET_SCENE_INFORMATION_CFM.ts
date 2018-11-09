'use strict';

import { GW_FRAME_CFM, GW_COMMON_STATUS } from "./common";

export class GW_GET_SCENE_INFORMATION_CFM extends GW_FRAME_CFM {
    public readonly Status: GW_COMMON_STATUS;
    public readonly SceneID: number;

    constructor(Data: Buffer) {
        super(Data);

        this.Status = this.Data.readUInt8(0);
        this.SceneID = this.Data.readUInt8(1);
    }
}
