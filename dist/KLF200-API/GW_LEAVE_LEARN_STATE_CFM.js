'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_LEAVE_LEARN_STATE_CFM extends common_1.GW_FRAME_CFM {
    constructor(Data) {
        super(Data);
        this.Status = this.Data.readUInt8(0);
    }
}
exports.GW_LEAVE_LEARN_STATE_CFM = GW_LEAVE_LEARN_STATE_CFM;
//# sourceMappingURL=GW_LEAVE_LEARN_STATE_CFM.js.map