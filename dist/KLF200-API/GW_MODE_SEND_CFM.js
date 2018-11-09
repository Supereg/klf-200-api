'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_MODE_SEND_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.SessionID = this.Data.readUInt16BE(0);
        this.ModeStatus = this.Data.readUInt8(2);
    }
}
exports.GW_MODE_SEND_CFM = GW_MODE_SEND_CFM;
//# sourceMappingURL=GW_MODE_SEND_CFM.js.map