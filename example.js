"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var src_1 = require("./src");
var rxjs_1 = require("rxjs");
var http = require("http");
var PORT = Number(process.env.PORT) || 3000;
var MyErrorHandler = function () {
    var _classDecorators = [(0, src_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MyErrorHandler = _classThis = /** @class */ (function () {
        function MyErrorHandler_1() {
        }
        MyErrorHandler_1.prototype.handleError = function (message$) {
            return message$.pipe((0, rxjs_1.tap)(function (_a) {
                var _b;
                var message = _a[0], error = _a[1];
                console.error("Error:", error);
                message.res.statusCode = 500;
                message.res.setHeader("Content-Type", "text/plain");
                message.res.setHeader("x-error", String((_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : ""));
                message.res.end("An error occurred");
            }), (0, rxjs_1.map)(function (_a) {
                var message = _a[0], error = _a[1];
                return message;
            }));
        };
        return MyErrorHandler_1;
    }());
    __setFunctionName(_classThis, "MyErrorHandler");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyErrorHandler = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyErrorHandler = _classThis;
}();
var MyHandler = function () {
    var _classDecorators = [(0, src_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MyHandler = _classThis = /** @class */ (function () {
        function MyHandler_1(service) {
            this.service = service;
        }
        MyHandler_1.prototype.handle = function (message$) {
            var _this = this;
            return message$.pipe((0, rxjs_1.tap)(function (message) {
                message.res.statusCode = 200;
                message.res.setHeader("Content-Type", "application/json");
                message.res.end(JSON.stringify({ message: _this.service.foo() }));
            }));
        };
        return MyHandler_1;
    }());
    __setFunctionName(_classThis, "MyHandler");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyHandler = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyHandler = _classThis;
}();
var Service = function () {
    var _classDecorators = [(0, src_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var Service = _classThis = /** @class */ (function () {
        function Service_1() {
        }
        Service_1.prototype.foo = function () {
            return 'asd';
        };
        return Service_1;
    }());
    __setFunctionName(_classThis, "Service");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Service = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Service = _classThis;
}();
var platform = src_1.Platform.createPlatform([{ provide: src_1.Handler, useClass: MyHandler }, { provide: src_1.ErrorHandler, useClass: MyErrorHandler }, { provide: Service, useClass: Service }]).platform;
var server = http.createServer(function (req, res) {
    platform.message.next({ req: req, res: res });
});
server.listen(PORT, function () {
    console.log("Platform-backed server listening: http://localhost:".concat(PORT));
});
