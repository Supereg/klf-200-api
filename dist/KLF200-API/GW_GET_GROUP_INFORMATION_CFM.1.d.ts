/// <reference types="node" />
import { GW_FRAME_CFM } from "./common";
import { Velocity, NodeVariation } from "./GW_SYSTEMTABLE_DATA";
import { GroupType } from "./GW_GROUPS";
export declare class GW_GET_GROUP_INFORMATION_CFM extends GW_FRAME_CFM {
    readonly GroupID: number;
    readonly Order: number;
    readonly Placement: number;
    readonly Name: string;
    readonly Velocity: Velocity;
    readonly GroupType: GroupType;
    readonly NodeVariation: NodeVariation;
    readonly Revision: number;
    readonly Nodes: number[];
    constructor(Data: Buffer);
}
