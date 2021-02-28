"use strict";
let $ = require('./lib/jquery.min');
let jQuery = require('./lib/jquery.min');
const {remote} = require('electron')
const ipcRenderer = require('electron').ipcRenderer;

let dock = function() {
    $(".close").on("click", function() {
        console.log("close")
        ipcRenderer.send('about-close', 'close');
    })
    $(".minimize").on("click", function() {
        console.log("minimize")
        ipcRenderer.send('about-min', 'min');
    })
    $(".zoom").on("click", function() {
        console.log("zoom")
        ipcRenderer.send('about-max', 'max');
    })
}



$(document).ready(function() {
    dock()
});