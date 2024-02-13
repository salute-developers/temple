"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Portal = exports.mount = exports.withNoAnimation = exports.SpaceMe = exports.PadMe = exports.CypressTestDecorator = exports.getComponent = void 0;
var react_1 = __importDefault(require("react"));
var react_dom_1 = require("react-dom");
var styled_components_1 = __importStar(require("styled-components"));
var react_2 = require("@cypress/react");
// plasma-ui
var themes_1 = require("@salutejs/plasma-tokens/themes");
var ThemeStyle = styled_components_1.createGlobalStyle(themes_1.darkSber);
exports.getComponent = function (componentName) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    var pkgName = Cypress.env('package');
    if (!pkgName) {
        throw new Error('Add package env to your Cypress config');
    }
    function check(component) {
        if (!component) {
            throw new Error("Library " + pkgName + " has no " + componentName);
        }
    }
    if (pkgName === 'plasma-ui') {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        var pkg = require('@salutejs/plasma-ui');
        var component = pkg[componentName];
        check(component);
        return component;
    }
    throw new Error("Library " + pkgName + " is not required in plasma-core/CypressHelpers:getComponent");
};
exports.CypressTestDecorator = function (_a) {
    var noSSR = _a.noSSR, children = _a.children;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    var pkgName = Cypress.env('package');
    var SSRProvider = exports.getComponent('SSRProvider');
    var SSR = function (_a) {
        var _noSSR = _a.noSSR, children = _a.children;
        if (_noSSR) {
            return react_1.default.createElement(react_1.default.Fragment, null, children);
        }
        return react_1.default.createElement(SSRProvider, null, children);
    };
    if (pkgName === 'plasma-ui') {
        var DeviceThemeProvider = exports.getComponent('DeviceThemeProvider');
        return (react_1.default.createElement(DeviceThemeProvider, null,
            react_1.default.createElement(SSR, { noSSR: noSSR },
                react_1.default.createElement(ThemeStyle, null),
                children)));
    }
    return react_1.default.createElement(react_1.default.Fragment, null, children);
};
exports.PadMe = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    padding: 5px;\n"], ["\n    padding: 5px;\n"])));
exports.SpaceMe = styled_components_1.default.span(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    padding: 5px;\n"], ["\n    padding: 5px;\n"])));
exports.withNoAnimation = function (Comp) {
    return styled_components_1.default(Comp)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        animation: none !important;\n        /* stylelint-disable-next-line selector-max-universal */\n        & * {\n            animation: none !important;\n        }\n    "], ["\n        animation: none !important;\n        /* stylelint-disable-next-line selector-max-universal */\n        & * {\n            animation: none !important;\n        }\n    "])));
};
exports.mount = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var jsx = args[0], _a = args[1], opts = _a === void 0 ? {} : _a;
    opts.stylesheets = ((opts === null || opts === void 0 ? void 0 : opts.stylesheets) || []).concat('https://cdn-app.sberdevices.ru/shared-static/0.0.0/styles/SBSansText.0.1.0.css', 'https://cdn-app.sberdevices.ru/shared-static/0.0.0/styles/SBSansDisplay.0.1.0.css');
    var cm = react_2.mount(jsx, opts);
    cy.waitForResources('https://cdn-app.sberdevices.ru/shared-static/0.0.0/styles/SBSansText.0.1.0.css');
    cy.waitForResources('https://cdn-app.sberdevices.ru/shared-static/0.0.0/styles/SBSansDisplay.0.1.0.css');
    cy.waitForResources('SBSansText.0.1.0.css', 'SBSansDisplay.0.1.0.css', { timeout: 1500 });
    return cm;
};
exports.Portal = function (_a) {
    var id = _a.id, children = _a.children;
    var el = document.createElement('div');
    react_1.default.useEffect(function () {
        var portalRoot = document.getElementById(id);
        portalRoot && portalRoot.appendChild(el);
        return function () {
            portalRoot && portalRoot.removeChild(el);
        };
    }, [el, id]);
    return react_dom_1.createPortal(children, el);
};
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=CypressHelpers.js.map