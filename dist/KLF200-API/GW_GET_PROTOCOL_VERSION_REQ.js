'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_PROTOCOL_VERSION_REQ extends common_1.GW_FRAME_REQ {
    constructor() {
        super();
    }
    InitializeBuffer() {
        this.AllocBuffer(0);
    }
}
exports.GW_GET_PROTOCOL_VERSION_REQ = GW_GET_PROTOCOL_VERSION_REQ;
//# sourceMappingURL=GW_GET_PROTOCOL_VERSION_REQ.js.map