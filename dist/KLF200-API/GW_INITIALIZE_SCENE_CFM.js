'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_INITIALIZE_SCENE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
    }
}
exports.GW_INITIALIZE_SCENE_CFM = GW_INITIALIZE_SCENE_CFM;
//# sourceMappingURL=GW_INITIALIZE_SCENE_CFM.js.map