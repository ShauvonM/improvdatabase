"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var showdown_1 = require("showdown");
var TextUtil = (function () {
    function TextUtil() {
    }
    TextUtil.stripTags = function (html) {
        if (!html) {
            return '';
        }
        // this will create a description string without any HTML tags in it
        var div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || html;
    };
    TextUtil.getMarkdownConverter = function () {
        var c = new showdown_1.Converter();
        c.setOption('openLinksInNewWindow', 'true');
        c.setOption('simplifiedAutoLink', 'true');
        c.setOption('excludeTrailingPunctuationFromURLs ', 'true');
        return c;
    };
    TextUtil.renderDescription = function (str) {
        if (str) {
            var converter = this.getMarkdownConverter();
            return converter.makeHtml(str);
        }
        else {
            return 'No Description';
        }
    };
    return TextUtil;
}());
exports.TextUtil = TextUtil;

//# sourceMappingURL=text.util.js.map
