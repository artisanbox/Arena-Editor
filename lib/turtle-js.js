"use strict";
const {remote} = require('electron')
const ipcRenderer = require('electron').ipcRenderer;

var initTurtle = function() {
        var n = document.getElementById("id-canvas"),
            e = new Turtle(n),
            t = !0,
            i = !1,
            o = void 0;
        try {
            for (var r, d = ["forward", "backward", "goto", "left", "right", "setHeading", "heading", "towards", "penup", "pendown", "setPenSize", "setPenColor", "show", "hide", "setDelay"][Symbol.iterator](); !(t = (r = d.next()).done); t = !0) {
                var u = r.value;
                window[u] = e[u].bind(e)
            }
        } catch (n) {
            i = !0, o = n
        } finally {
            try {
                !t && d.
                    return &&d.
                return ()
            } finally {
                if (i) throw o
            }
        }
        window.jump = function(n, e) {
            window.penup(), window.goto(n, e), window.pendown()
        }
    },
    initedCodeMirror = function() {
        var n = document.getElementById("code-mirror"),
            e = new CodeEditor(n);
        return e.setStyle({
            // height: "520px",
        }), e.editor
    },
    bindEventRun = function bindEventRun(codeMirror) {
        $("#button-run").on("click", function() {
            $("#traceBox").removeClass("gen-hiddenBox")
            $("#traceBox").addClass("gen-showBox")
            var code = codeMirror.getValue();
            // 简单 过滤掉 注释 "//",  /* 这个注释判断后序搞定 
            code = filterComment(code)
            var toggle = true
            var d = ["forward", "backward", "goto", "left", "right", "setHeading", "heading", "towards", "penup", "pendown", "setPenSize", "setPenColor", "show", "hide", "setDelay"]
            for (let i of d) {
                if (code.includes(i)) {
                    showPanel(code)
                    toggle = false
                    break
                }
            }
            if (toggle == true) {
                try {
                    eval(code)
                } catch(e) {
                    log("# " + e)
                }
            }
        })
    },
    bindEventClear = function() {
        $("#clearConsole").on("click", function() {
            console.log("button-clear")
            MyConsole.setValue("")
            MyConsole.focus();
        })
    },
    bindEvents = function(n) {
        bindEventRun(n), bindEventClear(n)
    },

__main = function() {
    n = initedCodeMirror();
    bindEvents(n)
    exports.n = n
};

let showPanel = function(code) {
    // console.log("code", code)
    var error = false
    let testWrapper = document.createElement('div');
    testWrapper.innerHTML = `
        <section style="border: 1px black solid;" class="lin-canvas-container hidden">
            <canvas id="id-canvas" width="800" height="600"></canvas>
        </section>
        `
    try {
        $("#main-container").append(testWrapper)
        initTurtle()
        eval(code)
        testWrapper.remove()
    } catch(e) {
        error = true
        log("# " + e)
    }
    console.log("error", error)
    if (error == false) {
        console.log("not error")
        ipcRenderer.send("myTurtle", code)
    }
    // console.log("error", error)
    // if (error == false) {
    //     $(".lin-canvas-container").removeClass("hidden");
    //     // console.log("testWrapper", testWrapper)
    //     swal({
    //         content: testWrapper,
    //         buttons: {
    //             close: "关闭",
    //         }
    //     }).then((value) => {
    //         switch (value) {
    //             case "close":
    //                 testWrapper.remove()
    //                 break
    //             default:
    //                 testWrapper.remove()
    //                 break
    //         }
    //     })
    // } else {
    //     testWrapper.remove()
    // }
}

var filterComment = function(code) {
    let lines = code.split("\n")
    for (let i in lines) {
        let line = lines[i]
        if (line.includes("//")) {
            let index = line.indexOf("//");
            line = line.replace(line.slice(index), "")
            lines[i] = line
            console.log("line", line)
        }
    }
    console.log("lines", lines)
    return lines.join("\n")
}

let n
$(document).ready(function() {
    __main()
});


