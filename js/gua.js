const ajax = function (request) {
    var r = new XMLHttpRequest()
    // 设置请求方法和请求地址
    r.open(request.method, request.url, true)
    r.setRequestHeader("Content-Type", "application/json")

    // 注册响应函数
    r.onreadystatechange = function() {
        if (r.readyState === 4) {
            if (r.status == 200) {
                request.callback(r.response)
            } else {
                console.log("网络错误")
            }
        }
    }

    // 发送请求
    let data = JSON.stringify(request.data)
    log("data", data)
    r.send(data)
}

const log = function() {
    // console.log.apply(console, arguments)
}

const e = function(selector) {
    return document.querySelector(selector)
}

const es = function(selector) {
    return document.querySelectorAll(selector)
}

const appendHtml = function(element, html) {
    element.insertAdjacentHTML('beforeend', html)
}

const beforeHtml = function(element, html) {
    element.insertAdjacentHTML('afterbegin', html)
}

const afterEndHtml = function(element, html) {
    element.insertAdjacentHTML('afterend', html)
}

const bindEvent = function(element, eventName, callback) {
    element.addEventListener(eventName, callback)
}

const toggleClass = function(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className)
    } else {
        element.classList.add(className)
    }
}

const addClassAll = function (selector, className) {
    let elements = document.querySelectorAll(selector)
    for (let element of elements) {
        element.classList.add(className)
    }
}

const removeClassAll = function(className) {
    let selector = '.' + className
    let elements = document.querySelectorAll(selector)
    for (let i = 0; i < elements.length; i++) {
        let e = elements[i]
        e.classList.remove(className)
    }
}

const removeClassAllWithCondition = function(className, removedType) {
    let selector = '.' + className
    let elements = document.querySelectorAll(selector)
    for (let i = 0; i < elements.length; i++) {
        let e = elements[i]
        log("e", e)
        if (e.dataset.type === removedType) {
            e.classList.remove(className)
        }
    }
}

// 给选中的所有 selector 绑定事件
const bindAll = function(selector, eventName, callback) {
    var elements = document.querySelectorAll(selector)
    for(var i = 0; i < elements.length; i++) {
        var e = elements[i]
        bindEvent(e, eventName, callback)
    }
}

// find 函数可以查找 element 的所有子元素
const find = function(element, selector) {
    return element.querySelector(selector)
}

// time fix 给你一个数字 给你转换为 00：00 这样的样式
const timeCount = function(n) {
    var intN = parseInt(n)
    var hour
    var min
    // log('intN', intN)
    if(intN < 60) {
        hour = '00'
        min = String(intN)
        // log("< 60", min)
    } else {
        hour = String(intN / 60).slice(0, 1)
        min = String(intN % 60)
        // log("> 60 hour", hour)
        // log("> 60 min", min)
    }
    if (min.length < 2) {
        min = '0' + min
    }
    if (hour.length < 2) {
        hour = '0' + hour
    }
    var time = hour + ':' + min
    return time
}

// 样式切换
const toggleSwitch = function(target, className) {
    removeClassAll(className)
    target.classList.add(className)
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

const checkEmail = function(strEmail) {
    if (strEmail.length == 0) {
        return false;
    }
    if (strEmail.indexOf("@", 0) == -1) {
        return false;
    }
    if (strEmail.indexOf(".", 0) == -1) {
        return false;
    }
    return true;
}

let md = function () {
    // let x = es(".markdown-body")
    let rawData = es(".markdown-body > p")
    for(let i = 0; i < rawData.length; i++) {
        log("ele", rawData[i])
        let ele = rawData[i].innerText
        let converter = new showdown.Converter()
        let html = converter.makeHtml(ele)
        log("html", html)
        document.querySelectorAll(".markdown-body")[i].innerHTML = html
    }
    let all = es(".markdown-body > p")
    for(let i = 0; i < all.length; i++) {
        let ppp = all[i].innerHTML
        log("ppp", ppp)
        all[i].innerHTML = ppp.replaceAll("\n", "<br>");
    }
    // 代码高亮
    let b = es(".markdown-body > pre > code")
    for (let i = 0; i < b.length; i++) {
        let ele = b[i].innerHTML
        es(".markdown-body > pre > code")[i].innerHTML = ""
        // let t = "<textarea id=\"code\" style=\"display: none;\" disabled>" + ele + "</textarea>"
        // es(".markdown-body > pre > code")[i].innerHTML = t
        let afterClean = cleanSome(ele)
        log("---afterClean", afterClean)
        log("---clean ele", afterClean.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").replaceAll("&nbsp;", " "))
        let myCodeMirror = CodeMirror(
            document.querySelectorAll(".markdown-body > pre > code")[i], {
                value: afterClean.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").replaceAll("&nbsp;", " "),
                // Java高亮显示
                mode:"javascript",

                // 显示行号
                lineNumbers:true,

                // 设置主题
                theme:"material",

                // 绑定Vim
                // keyMap:"vim",

                // 代码折叠
                // lineWrapping:true,
                // foldGutter: true,
                // gutters:["CodeMirror-linenumbers", "CodeMirror-foldgutter"],

                // 全屏模式
                // fullScreen:true,

                // 括号匹配
                matchBrackets:true,

                // 智能提示
                // extraKeys:{"Ctrl-Space":"autocomplete"},//ctrl-space唤起智能提示

                // 只读
                readOnly: true,

                // 空格优化
                showInvisibles: true,
            });
    }
}

let cleanSome = function(s) {
    return (s || "").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").replaceAll("&nbsp;", " ")
}

let opClean = function (s) {
    s = s.replaceAll("```", "")
    return "```&lt;br&gt;" +
        (s || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("&", "&amp;").replaceAll(" ", "&nbsp;")
        + "&lt;br&gt;```"
}

let timeForm = function (ctime) {
    return new Date(ctime * 1000).Format("yyyy/MM/dd hh:mm:ss");
}

let formUrl = function() {
    let url = window.location.href
    let index = url.indexOf("?")
    let parameters = url.substring(index + 1, url.length)
    let list = parameters.split("&")
    log("formUrl list", list)
    if (list[0] == "") {
        return null
    }
    let dic = {}
    for (let i = 0; i < list.length; i++) {
        let ele = list[i].split("=", 2)
        let key = ele[0]
        let value = ele[1]
        log("formUrl key", key)
        log("formUrl value", value)
        dic[key] = value
    }
    log("dic", dic)
    return dic
}

let copyByValue = function (value) {
    let aux = document.createElement("textarea");
    aux.value = value
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
}

// enter 提交数据
let enterSubmitData = function (action) {
    let button = action.button
    let inputList = action.inputList
    for (let input of inputList) {
        input.addEventListener("keydown", function (event) {
            log("password")
            let keyCode = event.keyCode || event.which;
            log("keycode", keyCode)
            if(keyCode == "13"){
                log("enter 13")
                action.callback(button)
            }
        })
    }
}

let enterSubmitDataWithActions = function (actions) {
    for (let i of actions) {
        enterSubmitData(i)
    }
}

let bindEach = function (bindObj) {
    let elements = bindObj.elements
    let event = bindObj.event
    for (let element of elements) {
        // bindEvent(element, event, bindObj.callback())
        // console.log("element", element)
        // console.log("value", element.value)
        element.addEventListener(event, function () {
            bindObj.callback()
        })
    }
}
