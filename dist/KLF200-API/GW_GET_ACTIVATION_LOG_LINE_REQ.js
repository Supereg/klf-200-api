'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class GW_GET_ACTIVATION_LOG_LINE_REQ extends common_1.GW_FRAME_REQ {
    constructor(Line) {
        super();
        this.Line = Line;
        const buff = this.Data.slice(this.offset);
        buff.writeUInt16BE(this.Line, 0);
    }
    InitializeBuffer() {
        this.AllocBuffer(2);
    }
}
exports.GW_GET_ACTIVATION_LOG_LINE_REQ = GW_GET_ACTIVATION_LOG_LINE_REQ;
//# sourceMappingURL=GW_GET_ACTIVATION_LOG_LINE_REQ.js.map