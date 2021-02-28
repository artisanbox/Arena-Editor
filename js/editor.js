"use strict";
var _createClass = function () {
    function n(e, t) {
        for (var i = 0; i < t.length; i++) {
            var n = t[i];
            n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n)
        }
    }
    return function (e, t, i) {
        return t && n(e.prototype, t), i && n(e, i), e
    }
}();

function _classCallCheck(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
}
var CodeEditor = function () {
        function n(e, t) {
            _classCallCheck(this, n);
            var i = this.defaultOptions();
            t = Object.assign({}, i, t), "textarea" === e.tagName.toLowerCase() ? this.editor = CodeMirror.fromTextArea(e, t) : this.editor = CodeMirror(e, t), this.rebindKeys()
        }
        return _createClass(n, [{
            key: "defaultOptions",
            value: function () {
                return {
                    lineNumbers: !0,
                    indentUnit: 4,
                    theme: "material",
                    styleActiveLine: !0,
                    matchBrackets: !0,
                    // viewportMargin: 1 / 0,
                    autoCloseBrackets: !0,
                    showTrailingSpace: !0,
                    showInvisibles: !0,
                    autofocus: true,
                    // lineWrapping: true,
                    // hintOptions: {
                    //     completeSingle: false
                    // }
                }
            }
        }, {
            key: "rebindKeys",
            value: function () {
                this.editor.setOption("extraKeys", {
                    Tab: (cm) => {
                        // 存在文本选择
                        if (cm.somethingSelected()) {   
                            // 正向缩进文本   
                            cm.indentSelection('add');    
                        } else {   
                            // 无文本选择                   
                            //cm.indentLine(cm.getCursor().line, "add");  
                            // 整行缩进 不符合预期
                            cm.replaceSelection(Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");  // 光标处插入 indentUnit 个空格
                        }   
                    },  
                    "Shift-Tab": (cm) => { 
                        // 反向缩进                
                        if (cm.somethingSelected()) {
                            // 反向缩进
                            cm.indentSelection('subtract'); 
                        } else {
                            // cm.indentLine(cm.getCursor().line, "subtract");  
                            // 直接缩进整行
                            const cursor = cm.getCursor();
                            cm.setCursor({line: cursor.line, ch: cursor.ch - 4});  
                            // 光标回退 indexUnit 字符
                        }   
                        return ;
                    },
                })
            }
        }, {
            key: "getValue",
            value: function () {
                return this.editor.getValue()
            }
        }, {
            key: "setValue",
            value: function (e) {
                this.editor.setValue(e)
            }
        }, {
            key: "setStyle",
            value: function (e) {
                for (var t = this.editor.getWrapperElement(), i = 0; i < Object.keys(e).length; i++) {
                    var n = Object.keys(e)[i];
                    t.style[n] = e[n]
                }
            }
        }]), n
    }(),
    MarkdownEditor = function () {
        function a(e, t) {
            var i = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {};
            _classCallCheck(this, a), this.code = [], this.language = [];
            var n = this.defaultOptions();
            i = Object.assign({}, n, i), this.html = marked(e, i), this.element = t
        }
        return _createClass(a, [{
            key: "defaultOptions",
            value: function () {
                var i = this;
                return {
                    gfm: !0,
                    tables: !0,
                    breaks: !0,
                    sanitize: !0,
                    highlight: function (e, t) {
                        i.code.push(e), i.language.push(t)
                    }
                }
            }
        }, {
            key: "render",
            value: function () {
                var e = this.element,
                    t = this.html;
                e.innerHTML = t
            }
        }, {
            key: "highlightWithCodeMirror",
            value: function () {
                var n = this,
                    e = $(this.element).find("pre").find("code");
                $.each(e, function (e, t) {
                    var i = {
                        value: n.code[e],
                        readOnly: !0,
                        mode: n.language[e] || "javascript"
                    };
                    $(t).empty(), new CodeEditor(t, i)
                })
            }
        }, {
            key: "highlightWithPrism",
            value: function () {
                var a = this,
                    e = $(this.element).find("pre").find("code");
                $.each(e, function (e, t) {
                    var i = a.language[e] || "javascript",
                        n = Prism.highlight(a.code[e], Prism.languages[i]);
                    t.innerHTML = n
                })
            }
        }]), a
    }();