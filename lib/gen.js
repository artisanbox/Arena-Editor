var log = function () {
    console.log.apply(console, arguments)
    var out = ""
    for (let i in arguments) {
        console.log("typeof ele", typeof arguments[i])
        let type = typeof arguments[i]
        let ele = arguments[i]
        if (type != "number" && type != "string") {
            ele = JSON.stringify(ele)
        }
        console.log("ele", ele)
        if (i == 0) {
            out += "" + ele
        } else {
            out += " " + ele
        }  
    }
    console.log("out", out)
    out = out + "\n"
    console.log("out[0]", out[0])
    console.log("out[out.length - 2]", out[out.length - 2])
    if (out[0] == `"` && out[out.length - 2] == `"`) {
        out = out.substring(1, out.length - 2) + "\n"
    }
    
    MyConsole.replaceRange(out, CodeMirror.Pos(MyConsole.lastLine()))
    MyConsole.setCursor(MyConsole.lineCount(), 0);
}

let MyConsole
let consoleEditor = function () {
    MyConsole = CodeMirror (
        document.querySelector("#id-console"), {
            value: "",
            // Java高亮显示
            mode:"javascript",

            // 设置主题
            theme:"idea",

            // 只读
            readOnly: true,

            // 显示行号
            // lineNumbers:true,
        });
}

const ajax = function (request) {
    var r = new XMLHttpRequest()
    // 设置请求方法和请求地址
    r.open(request.method, request.url, true)
    r.setRequestHeader("Content-Type", "application/json")

    // 注册响应函数
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
    r.send(data)
}

let __genMain = function() {
    consoleEditor()
}

__genMain()