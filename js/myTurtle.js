"use strict";
let $ = require('./lib/jquery.min.js');
let jQuery = require('./lib/jquery.min.js');
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
}

let drawImg = function() {
    console.log("drawImg");
    ipcRenderer.on('myTurtle-reply', function(event, arg) {
        console.log("myTurtle-reply", arg);
        eval(arg)
        event.sender.send('myTurtle-reply', 'get-myTurtle-reply');
        dock()
    });
}

let log = function() {

}

let dock = function() {
    $(".close").on("click", function() {
        console.log("close")
        ipcRenderer.send('turtle-close', 'close');
    })
    $(".minimize").on("click", function() {
        console.log("minimize")
        ipcRenderer.send('turtle-min', 'min');
    })
    $(".zoom").on("click", function() {
        console.log("zoom")
        ipcRenderer.send('turtle-max', 'max');
    })
}

$(document).ready(function() {
    initTurtle()
    drawImg()
});

