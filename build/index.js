"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineFaces = void 0;
__exportStar(require("./util/_types/IFace"), exports);
__exportStar(require("./util/_types/IPoint"), exports);
__exportStar(require("./util/_types/ISegment"), exports);
__exportStar(require("./util/_types/ISimplePolygon"), exports);
__exportStar(require("./util/BalancedSearchTree"), exports);
__exportStar(require("./util/Side"), exports);
__exportStar(require("./util/doesIntersect"), exports);
__exportStar(require("./util/getSideOfLine"), exports);
__exportStar(require("./util/pointEquals"), exports);
__exportStar(require("./util/getIntersectionPoint"), exports);
__exportStar(require("./util/shuffle"), exports);
var combineFaces_1 = require("./combineFaces");
Object.defineProperty(exports, "combineFaces", { enumerable: true, get: function () { return combineFaces_1.combineFaces; } });
//# sourceMappingURL=index.js.map