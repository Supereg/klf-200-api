'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_NETWORK_SETUP_REQ extends common_1.GW_FRAME_REQ {
    constructor() {
        super();
    }
    InitializeBuffer() {
        this.AllocBuffer(0);
    }
}
exports.GW_GET_NETWORK_SETUP_REQ = GW_GET_NETWORK_SETUP_REQ;
//# sourceMappingURL=GW_GET_NETWORK_SETUP_REQ.js.map