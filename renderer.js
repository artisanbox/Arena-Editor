let fs = require('fs')
const {remote} = require('electron')
const { FindInPage } = require('electron-find')

let findInPage = new FindInPage(remote.getCurrentWebContents(), {
    offsetTop: 110,
    offsetRight: 20,
})
// 右键菜单粘贴功能 undo
const {Menu, MenuItem} = remote
// 右键餐单
const menu = new Menu();
const ipcRenderer = require('electron').ipcRenderer;
// 编辑器
let mainEditor = require('./lib/turtle-js');

console.log = function() {

}

let shortcut = function() {
    let focus = true
    remote.app.on("browser-window-focus", function(event, window) {
        console.log('focus')
        focus = true
    })
    remote.app.on("browser-window-blur", function(event, window) {
        console.log('blur')
        focus = false
    })
    remote.globalShortcut.register('CommandOrControl+F', () => {
        // Do stuff when Y and either Command/Control is pressed.
        console.log("find begin")
        if (focus == true) {
            findInPage.openFindWindow()
        }
    })
    remote.globalShortcut.register('CommandOrControl+S', () => {
        // Do stuff when Y and either Command/Control is pressed.
        if (focus == true) {
            console.log("ctrl s")
            let tabId = $(".chrome-tabs-content").data("active")
            console.log("tabId", tabId)
            if (findData({id: tabId}) != null) {
                let findedELe = findData({id: tabId})
                console.log('findedELe', findedELe)
                let id = findedELe.id
                let path = findedELe.path
                let filename = findedELe.filename
                let content = findedELe.content
                // path 为 "" 是新建文件
                if (path == "") {
                    let form = curTab()
                    console.log('快捷键保存新建文件', form)
                    saveAnotherDialog(form, true)
                } else {
                    fs.writeFile(path, content, (err) => {
                        if (err) {
                            console.log("err", err)
                            swal({
                                icon: "error",
                                title: "The save failed",
                                buttons: {
                                    no: "Please try again",
                                }
                            })
                            return false
                        }
                        console.log('文件已被保存');
                        let newFilename = filename.replace(" - 未保存", "")
                        let title = newFilename + " - Arena"
                        let updateForm = {
                            filename: newFilename,
                            title: title,
                        }
                        updateCurTab(updateForm)
                        updateFilename({
                            id: id,
                            filename: newFilename,
                        })
                        // swal({
                        //     icon: "success",
                        //     title: "保存成功",
                        //     buttons: {
                        //         ok: "确定",
                        //     }
                        // })
                        // let updateSign = `
                        //     <div id="id-show-message-update" class="alert alert-success" role="alert">
                        //         <button style="position: relative;top: 0px;margin: 5px;" type="button" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        //         <strong>Success</strong>
                        //         保存成功
                        //     </div>
                        // `
                        // $('.lin-control-blocks').before(updateSign)
                        // window.setTimeout(function() {
                        //     $(".alert").fadeTo(500, 0).slideUp(500, function(){
                        //         $(this).remove();
                        //     });
                        // }, 2000);
                    });
                }
                
            }
        }
    })
    remote.globalShortcut.register('CommandOrControl+R', () => {
        // Do stuff when Y and either Command/Control is pressed.
        console.log("ctrl r")
        if (focus == true) {
            $("#button-run").click()
        }
    })

    let addCommnet = function(all, beforeLine, afterLine) {
        console.log("all", all)
        let allList = all.split("\n")
        let allLength = allList.length
        console.log("all.split", all.split("\n"))
        console.log("allLength", allLength)
        let afterCh = allList[allLength - 1].length
        console.log("all[allLength - 1]", allList[allLength - 1])
        console.log("afterCh", afterCh)
        for (let i in allList) {
            let ele = allList[i]
            let newEle = "// " + ele
            allList[i] = newEle
        }
        console.log("allList", allList)
        console.log("allList.join", allList.join("\n"))
        
        let from = {
            line: beforeLine,
            ch: 0,
        }
        let to = {
            line: afterLine,
            ch: afterCh,
        }
        mainEditor.n.replaceRange(allList.join("\n"), from, to)
    }

    // 如果 每行代码的 最前面有 // 则去掉
    let fadeComment = function(all, beforeLine, afterLine) {
        let allList = all.split("\n")
        let allLength = allList.length
        let afterCh = allList[allLength - 1].length
        for (let i = 0; i < allLength; i++) {
            let ele = allList[i]
            console.log("fadeComment ele", ele)
            if (allList[i].includes("// ")) {
                allList[i] = ele.replace("// ", "")
            } else if (allList[i].includes("//")) {
                allList[i] = ele.replace("//", "")
            }
            
            console.log("fadeComment all[i]", allList[i])
        }
        console.log("fadeComment all", allList)
        let from = {
            line: beforeLine,
            ch: 0,
        }
        let to = {
            line: afterLine,
            ch: afterCh,
        }
        mainEditor.n.replaceRange(allList.join("\n"), from, to)
    }

    remote.globalShortcut.register('CommandOrControl+/', () => {
        // Do stuff when Y and either Command/Control is pressed.
        console.log("ctrl /")
        if (focus == true) {
            let listSelections = mainEditor.n.listSelections()[0]
            let head = listSelections.head
            let anchor = listSelections.anchor
            
            let beforeLine = Math.min(head.line, anchor.line)
            let afterLine = Math.max(head.line, anchor.line)

            let all = ""
            for (let i = beforeLine; i <= afterLine; i++) {
                console.log("content", mainEditor.n.getLine(i))
                let line = mainEditor.n.getLine(i)
                mainEditor.n.getLineHandle(i)
                all += line + "\n"
            }
            // 去掉最后一个 \n
            all = all.slice(0, all.length - 1)
            
            console.log("all", all)
            console.log("all.split", all.split("\n"))

            // 如果选中的有一个不在不是注释 里面 就 调用 addComment
            // 如果全部是注释 里面 就 调用 fadeComment
            
            let bool = true
            // for (let i = beforeLine; i <= afterLine; i++) {
            //     // 不存在
            //     let styles = mainEditor.n.getLineHandle(i).styles[2]
            //     console.log("styles", styles)
            //     if (!(styles || "").includes("comment")) {
            //         bool = false
            //         break
            //     }
            // }
            for (let i = beforeLine; i <= afterLine; i++) {
                // 不存在
                let styles = mainEditor.n.getLineHandle(i).styles
                let lineBool = true
                // 判断一行是不是注释
                for (let j = 0; j < styles.length; j++) {
                    let style = styles[j]
                    console.log("___", style)
                    if (style != null && 
                        typeof style != "number" && 
                        style.toString() != "overlay whitespace whitespace-4") {
                        // 过滤 number 和 space
                        if (!style.toString().includes("comment")) {
                            bool = false
                            break
                        }
                    }
                }
            }
            console.log("bool", bool)
            if (bool == false) {
                addCommnet(all, beforeLine, afterLine)
            } else {
                fadeComment(all, beforeLine, afterLine)
            }
        }
    })
    
}

let quitCheck = function() {
    ipcRenderer.on('main-process-messages', (event, arg) => {
        console.log(arg);
        if (arg == 'beforeCopy') {
            let all = allData()
            let bool = false
            let delList = []
            for (let ele of all) {
                // 自动保存不需要这些代码
                // if (ele.filename.includes("- 未保存")){
                //     bool = true
                // }
                if (ele.path == "" && ele.content != "") {
                    bool = true
                }
                // path 为空 都会被删除, 除非你终止关闭窗口
                // 去手动保存
                // if (ele.path == "") {
                //     delList.push(ele.id)
                // }
                if (ele.path == "" && ele.content == "") {
                    delList.push(ele.id)
                }
            }
            if (bool == true) {
                swal({
                    icon: "warning",
                    title: "Are you sure you want to quit?",
                    text: "The \"New Tab\" file has not been saved",
                    buttons: {
                        quit: "Quit",
                        // saveAll: "保存全部",
                        cancel: "Cancel",
                    }
                }).then((value) => {
                    switch (value) {
                        case "quit":
                            for (let id of delList) {
                                delData({id: id})
                            }
                            ipcRenderer.send('main-process-messages', 'close');
                            break
                        case "cancel":
                            ipcRenderer.send('main-process-messages', 'keep');
                            break
                        case "saveAll":
                            saveAll(function() {
                                ipcRenderer.send('main-process-messages', 'close');
                            })
                            break
                        default:
                            ipcRenderer.send('main-process-messages', 'keep');
                            break
                    }
                })
                // remote.dialog.showMessageBox({
                //     type: 'warning',
                //     title: "你还有未保存的文件",
                //     message: "您确定退出吗 ?",
                //     buttons: ["OK", "Cancel"]
                // }).then(result => {
                //     console.log("您的选择:" , result.response);
                //     console.log(result)
                //     if (result.response == 0) {
                        // ipcRenderer.send('main-process-messages', 'close');
                        // for (let id of delList) {
                        //     delData({id: id})
                        // }
                //     } else {
                //         ipcRenderer.send('main-process-messages', 'keep');
                //     }
                // }).catch(err => {
                //     console.log(err)
                // })
            } else {
                for (let id of delList) {
                    delData({id: id})
                }
                ipcRenderer.send('main-process-messages', 'close');
            }
        }
    });    
}

let saveAll = function(callback) {
    let all = allData()
    for(let ele of all) {
        if (ele.path != "") {
            saveFile(ele, false, function(ele) {
                console.log("callback", ele)
                ele.filename = ele.filename.replace(" - 未保存", "")
                updateFilename(ele)
            })
        }
    }
    callback()
}

var pushData = function(form) {
   // console.log("form", form)
   let genEditor = JSON.parse(localStorage.genEditor)
   // console.log("genEditor", genEditor)
   let len = genEditor.length
   genEditor[len] = form
   localStorage.genEditor = JSON.stringify(genEditor)
   // console.log("localStorage", localStorage.genEditor)
}

var allData = function() {
    return JSON.parse(localStorage.genEditor)
}

var delData = function(form, callback) {
    let genEditor = allData()
    for (let i = 0; i < genEditor.length; i++) {
        let ele = genEditor[i]
        let id = ele.id
        if (id == form.id) {
            console.log("deleted id", id)
            genEditor.splice(i, 1)
            localStorage.genEditor = JSON.stringify(genEditor)
            if (callback != null) {
                callback()
            }
            break
        }
    }
}

var findData = function(form) {
    let genEditor = allData()
    for (let i = 0; i < genEditor.length; i++) {
        let ele = genEditor[i]
        let id = ele.id
        if (id == form.id) {
            return ele
        }
    }
    return null
}

var findSamePathData = function(form) {
    let genEditor = allData()
    for (let i = 0; i < genEditor.length; i++) {
        let ele = genEditor[i]
        let path = ele.path
        if (path == form.path) {
            return ele
        }
    }
    return null
}

var updateDataById = function(id) {
    let genEditor = allData()
    for (let i = 0; i < genEditor.length; i++) {
        let ele = genEditor[i]
        if (ele.id == id) {
            if (ele.path == "") {
                ele.content = mainEditor.n.getValue()
                localStorage.genEditor = JSON.stringify(genEditor)
                return
            }
            console.log("update ele", ele)
            ele.content = mainEditor.n.getValue()
            fs.readFile(ele.path, 'utf-8', (err, data) => {
                if (err) {
                    removeCurTab()
                    // delData({id: id}, function() {
                    //     initTabs()
                    // })
                    console.log("err", err)
                    swal({
                        icon: "error",
                        title: "The file was lost",
                        text: "The file has been deleted",
                        buttons: {
                            yes: "Confirm",
                        }
                    })
                    return false
                }
                console.log("updateDataById data", data)
                let updateViewForm = {
                    content: ele.content,
                    filename: ele.filename,
                    title: ele.filename + " - Arena",
                    path: ele.path,
                }
                if (ele.content != data) {
                    saveFile(updateViewForm, false, null)
                }
                localStorage.genEditor = JSON.stringify(genEditor)
                console.log("updateViewForm", updateViewForm)
                updateCurTab(updateViewForm)
            })
            
        }
    }
}

var updateFilename = function(form) {
    let genEditor = allData()
    for (let i = 0; i < genEditor.length; i++) {
        let ele = genEditor[i]
        if (ele.id == form.id) {
            ele.filename = form.filename
            localStorage.genEditor = JSON.stringify(genEditor)
            break
        }
    }
}

var updateContent = function(form) {
    let genEditor = allData()
    for (let i = 0; i < genEditor.length; i++) {
        let ele = genEditor[i]
        if (ele.id == form.id) {
            ele.content = form.content
            localStorage.genEditor = JSON.stringify(genEditor)
            break
        }
    }
}

var updateAll = function(form) {
    let genEditor = allData()
    for (let i = 0; i < genEditor.length; i++) {
        let ele = genEditor[i]
        if (ele.id == form.id) {
            ele.filename = form.filename
            ele.path = form.path
            ele.content = form.content
            localStorage.genEditor = JSON.stringify(genEditor)
            break
        }
    }
}

var findTabById = function(id) {
    let tabs = $(".chrome-tabs-content").children()
    tabs.each(function(i, n) {
        var tab = $(n)
        var curId = tab.data("tabId")
        if (curId == id) {
            return tab
        }
    })
}

// 添加完数据后 改变视图
var modifyTab = function(form) {
    console.log("maxId", maxId())
    // if (maxId() - 1 == 0) {
    //     console.log("true")
    //     mainEditor.n.setValue(form.content)
    //     let tab = findTabById(form.id)
    //     tab.querySelector('.chrome-tab-title').textContent = form.filename
    //     let title = form.filename + " - Arena"
    //     $("title").text(title)
    // } else {
    //     console.log("false")
    //     chromeTabs.addTab({
    //         title: form.filename,
    //         favicon: false,
    //         id: form.id,
    //     })
    //     mainEditor.n.setValue(form.content)
    // }
    chromeTabs.addTab({
        title: form.filename,
        favicon: false,
        id: form.id,
    })
    mainEditor.n.setValue(form.content)
}

// [] len 0 id 0
// [a] len 1 id 1
let maxId = function() {
    let idArr = []
    let len = allData().length
    if (len == 0) {
        return "0"
    } else {
        for(let i in allData()) {
            let ele = allData()[i]
            idArr.push(parseInt(ele.id))
        }
        return (idArr[len - 1] + 1).toString()
    }
    
}

let getFileName = function(path) {
    path = path.replaceAll("\\", "/")
    var index = path.lastIndexOf("/") 
    var fileName = path.substr(index + 1)
    return fileName;
}

//设置菜单
let setDockMenu = function() {
    let dockMenu = remote.Menu.buildFromTemplate([
        {
            label: '文件', submenu: [
                {
                    label: '新建', click: function () {
                        console.log('新建')
                        newTab()
                    }
                },
                {
                    label: '打开', click: function () {
                        console.log('打开')
                        OpenDialog()
                    }
                },
                {
                    label: '保存', click: function () {
                        let form = curTab()
                        if (form.path == "") {
                            console.log('保存新建文件', form)
                            saveAnotherDialog(form, true)
                        } else {
                            console.log('保存, form', form)
                            saveFile(form, true)
                        }
                    }
                },
                {
                    label: '另存为', click: function() {
                        let tab = curTab()
                        console.log("另存为, tab", tab)
                        saveAnotherDialog(tab)
                    }
                },
            ]
        },
        {
            label: '编辑', submenu: [
                {
                    label: '复制', click: function() {
                        ipcRenderer.send('asynchronous-message', 'copy');
                    }
                },
                {
                    label: '粘贴', click: function() {
                        ipcRenderer.send('asynchronous-message', 'paste');
                    }
                },
                {
                    label: '剪贴', click: function() {
                        ipcRenderer.send('asynchronous-message', 'cut');
                    }
                },
                {
                    label: '查找', click: function() {
                        findInPage.openFindWindow()
                    }
                },
            ]
        },
        {
            label: '调试', submenu: [
                {
                    label: '运行 JS', click: function() {
                        $("#button-run").click()
                    }
                },
                {
                    label: '打开 Console', click: function() {
                        $("#traceBox").removeClass("gen-hiddenBox")
                        $("#traceBox").addClass("gen-showBox")
                    }
                },
            ]
        },
        {
            label: '其他', submenu: [
                {
                    label: '帮助', click: function() {
                        remote.dialog.showMessageBox({
                            type: 'info',
                            title: "帮助",
                            message: "Arena",
                            detail: `Arena 是一款 轻量级的 JS 编辑器
Arena 1.0 中我们在 Arena 中内置了画图功能
相关 Arena 画图 API 请到 vip.juantu.cn/arena 中查看
`,
                            buttons: ["OK"],
                        }).then(result => {
                            console.log("您的选择:" , result.response);
                            console.log(result)
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                },
                {
                    label: '联系', click: function() {
                        remote.dialog.showMessageBox({
                            type: 'info',
                            title: "联系",
                            message: "联系作者",
                            detail: `官网: vip.juantu.cn
相关 Bug 问题请发送 email 到 barrylogen@outlook.com
`,
                            buttons: ["OK"],
                        }).then(result => {
                            console.log("您的选择:" , result.response);
                            console.log(result)
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                },
                {
                    label: '关于', click: function() {
                        remote.dialog.showMessageBox({
                            type: 'info',
                            title: "关于",
                            message: "Arena",
                            detail: `Version: Beta 1.2.0
Date: 2021-02-22T11:21:44.058Z
Electron: 11.3.0
Chrome: 76.0.3809.146
Node.js: 12.18.4
Author: Juantu
WebSite: vip.juantu.cn`,
                            buttons: ["OK"],
                        }).then(result => {
                            console.log("您的选择:" , result.response);
                            console.log(result)
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                },
            ]
        }
    ]);
    remote.Menu.setApplicationMenu(dockMenu);       
}

let rightMenu = function() {
    ipcRenderer.on('asynchronous-reply', function(event, arg) {
        console.log(arg); // prints "pong"
    });
    
    menu.append(new MenuItem({
        label: '剪贴', 
        click:function ()  {
            console.log('剪贴')
            ipcRenderer.send('asynchronous-message', 'cut');
        }
    }));
    // menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({
        label: '复制',
        click:function ()  {
            console.log('复制')
            ipcRenderer.send('asynchronous-message', 'copy');
        }
    }));
    // menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({
        label: '粘贴', 
        click:function ()  {
            console.log('粘贴')
            ipcRenderer.send('asynchronous-message', 'paste');
        }
    }));
    // menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({
        label: '查找', 
        click:function ()  {
            console.log('查找')
            let findInPage = new FindInPage(remote.getCurrentWebContents(), {
                offsetTop: 110,
                offsetRight: 20,
            })
            findInPage.openFindWindow()
        }
    }));
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        menu.popup({
            window: remote.getCurrentWindow()
        })
    }, false)
}

function newTab() {
    let form = {
        id: maxId(),
        path: "",
        filename: "New Tab",
        content: "",
    }
    console.log("---newTab", form)
    pushData(form)
    modifyTab(form)
}

function OpenDialog() {
    remote.dialog.showOpenDialog({
        title: "Please select a file",
        buttonLabel: "Confirm",
        filters: [
            {
              name: 'Custom File Type', 
              extensions: ['js', 'html', 'json', 'gen', 'txt'] 
            },
          ]
    }).then(result => {
        console.log(result.filename)
        console.log(result.canceled)
        console.log(result.filePaths)
        let path = result.filePaths[0]
        let filename = getFileName(path)
        console.log("filename", filename)
        openFile(path)
        // fs.readFile(path, 'utf-8', (err, data) => {
        //     if (err) {
        //         console.log("err", err)
        //         return false
        //     }
        //     let content = data
        //     console.log("data", data)
        //     let form = {
        //         id: maxId(),
        //         path: path,
        //         filename: filename,
        //         content: content,
        //     }
        //     pushData(form)
        //     modifyTab(form)
        // })
    }).catch(err => {
        console.log(err)
    })
}

// 第二个参数代表是否是新建文件
function saveAnotherDialog(tab, bool) {
    remote.dialog.showSaveDialog (
        {
            title: "Save As",
            defaultPath: tab.path,
            filters: [
                {
                    name: "All Files",
                    extensions: ['js', 'html', 'json', 'gen', 'txt'] ,
                }
            ]
        }
    ).then(result => {
        console.log(result)
        let canceled = result.canceled
        let newPath = result.filePath
        if (canceled == false) {
            fs.writeFile(newPath, tab.content, 'utf-8', function(err) {
                if (err) {
                    console.log("err", err)
                    return false
                }
                // remote.dialog.showMessageBox({
                //     type: 'none',
                //     title: "另存为成功",
                //     message: "文件新地址: " + newPath,
                //     buttons: ["OK"]
                // })
                swal({
                    icon: "success",
                    title: "The save was successful",
                    text: newPath,
                    buttons: {
                        yes: "Confirm",
                    }
                })
                if (bool == true) {
                    fs.readFile(newPath, 'utf-8', (err, data) => {
                        if (err) {
                            console.log("err", err)
                            return false
                        }
                        let form = {
                            id: tab.id,
                            path: newPath,
                            filename: getFileName(newPath),
                            content: data,
                        }
                        console.log("新建文件 返回的 form", form)
                        updateCurTab(form)
                        updateAll(form)
                    })
                }
          })
        }
    }).catch(err => {
        console.log(err)
    })
}

// Dialog 例子
function ShowMessageDialog() {
    dialog.showMessageBox({
        type: 'warning',
        title: "您确定么？",
        message: "您真的想要删除这条数据么？",
        buttons: ["OK", "Cancel"]
    }).then(result => {
        console.log("您的选择:" , result.response);
        console.log(result)
    }).catch(err => {
        console.log(err)
    })
}

let openFile = function(path) {
    // 这里打开文件可能是重复打开
    // 我们需要判断一下, 是否已经重复打开
    // 如果是重复打开的话, 我们需要把对应的 tab 添加 active
    // active id 也要变

    // 为 null 没有重复的, 原样执行即可
    let findedELe = findSamePathData({path: path})
    console.log("openFile finded", findedELe)
    if (findedELe == null) {
        let filename = getFileName(path)
        console.log("openFile filename", filename)
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                console.log("err", err)
                return false
            }
            let content = data
            console.log("data", data)
            let form = {
                id: maxId(),
                path: path,
                filename: filename,
                content: content,
            }
            pushData(form)
            modifyTab(form)
        })
    } else {
        // 拿到 id 需要拿到他的 html 元素
        // 然后设置 active
        let id = findedELe.id
        let content = findedELe.content
        let filename = findedELe.filename
        // 先设置 active id
        $(".chrome-tabs-content").data("active", id)
        // 找到 所有的 tabs 遍历 寻找 id 对应的
        let tabs = $(".chrome-tabs-content").children()
        // remove 所有的 active style
        console.log("remove 所有的 active style")
        tabs.each(function(i, n){
            let obj = $(n)
            obj.removeAttr("active")
        })
        console.log("给 对应 id 加上 active")
        tabs.each(function(i, n){
            let obj = $(n)
            let curId = obj.data("tabId")
            console.log("openFile obj", obj)
            console.log("openFile curId", curId)
            if (id == curId) {
                let title = filename + " - Arena"
                obj.attr("active", "")
                $("#id-mac-title").text(title)
                mainEditor.n.setValue(content)
            }
        });
    }
    
}

let initTabs = function() {
    console.log("initTabs, chrome-tab.length", $(".chrome-tab").length)
    if ($(".chrome-tab").length == 0) {
        console.log("add new Tab")
        // $("title").text("New Tab - Arena")
        chromeTabs.addTab({
            title: 'New Tab',
            favicon: false,
            id: maxId(),
        })
        let title = 'New Tab' + " - Arena"
        $("#id-mac-title").text(title)
        mainEditor.n.setValue("")
        let form = {  
            id: maxId(),
            path: "",
            filename: 'New Tab',
            content: "",
        }
        let defaulGenEditor = allData()
        defaulGenEditor[0] = form
        localStorage.genEditor = JSON.stringify(defaulGenEditor)
    }
}

let saveFile = function(form, tip, callback) {
    let path = form.path
    let content = form.content
    fs.writeFile(path, content, (err) => {
        if (err) {
            console.log("err", err)
            if (tip == true) {
                swal({
                    icon: "error",
                    title: "The save failed",
                    buttons: {
                        no: "Please try again",
                    }
                })
            }
            return false
        }
        console.log('文件已被保存');
        // chromeTabs.removeTab(detail.tabEl)
        // initTabs()
        if (tip == true) {
            swal({
                icon: "success",
                title: "The save was successful",
                buttons: {
                    ok: "Confirm",
                }
            })
        }
        if (callback != null) {
            callback(form)
        }
    });
}

let curTab = function() {
    let id = $(".chrome-tabs-content").data("active")
    let tab = findData({id: id})
    if (tab != null) {
        let content = tab.content
        let path = tab.path
        let filename = tab.filename 
        let form = {
            id: id,
            content: content,
            filename: filename,
            path: path,
        }
        return form
    } else {
        // 新建的文件
        let content = mainEditor.n.getValue()
        let path = ""
        let filename = "New Tab"
        let form = {
            id: id,
            content: content,
            filename: filename,
            path: path,
        }
        return form
    }
    
}

let updateCurTab = function(form) {
    let id = $(".chrome-tabs-content").data("active")
    let filename = form.filename
    let title = form.title
    let tabs = $(".chrome-tabs-content").children()
    tabs.each(function(i, n){
        var obj = $(n)
        var curId = obj.data("tabId")
        console.log("obj", obj)
        console.log("curId", curId)
        if (id == curId) {
            obj.find('.chrome-tab-title').text(filename)
            $("#id-mac-title").text(title)
            // mainEditor.n.setValue(content)
        }
    });
}

let removeCurTab = function() {
    let id = $(".chrome-tabs-content").data("active")
    let tabs = $(".chrome-tabs-content").children()
    tabs.each(function(i, n){
        var obj = $(n)
        var curId = obj.data("tabId")
        console.log("obj", obj)
        console.log("curId", curId)
        if (id == curId) {
            obj.find('.chrome-tab-close').click()
        }
    });
}

let chromeMonitor = function() {
    // tabRemove
    el.addEventListener('tabRemove', function({detail}) {
        console.log('remove tab', detail.tabEl)
        let ele = detail.tabEl
        let tabId = ele.dataset.tabId
        console.log("tabId", tabId)
        if (findData({id: tabId}) != null) {
            console.log("找到了")
            let findedELe = findData({id: tabId})
            console.log('findedELe', findedELe)
            let id = findedELe.id
            let path = findedELe.path
            let fileName = findedELe.filename
            let content = findedELe.content
            console.log("Remove path", path)
            console.log("Remove content", content)
            if (path == "") {
                console.log("path 为空")
                console.log("tabId", tabId)
                if (content != "") {
                    swal({
                        icon: "warning",
                        title: "Do you want to save the changes you made?",
                        text: "Your changes will be lost if you don't save it",
                        buttons: {
                            save: "Save",
                            // saveAll: "保存全部",
                            no: "Don't Save",
                            cancel: "Cancel",
                        }
                    }).then((value) => {
                        switch (value) {
                            case "save":
                                let tab = curTab()
                                saveAnotherDialog(tab)
                                break
                            case "cancel":
                                
                                break
                            case "no":
                                chromeTabs.removeTab(detail.tabEl)
                                delData({id: tabId}, function() {
                                    initTabs()
                                })
                                break   
                            default:
                                
                                break
                        }
                    })
                    
                } else {
                    chromeTabs.removeTab(detail.tabEl)
                    delData({id: tabId}, function() {
                        initTabs()
                    })
                }
            } else {
                console.log("判断 原始文件 和 localStor 里的数据")
                // 判断 原始文件 和 localStor 里的数据
                // 提示用户是否要修改
                fs.readFile(path, 'utf-8', (err, rawData) => {
                    if (err) {
                        console.log("dudu err", err)
                        chromeTabs.removeTab(detail.tabEl)
                        delData({id: tabId}, function() {
                            initTabs()
                        })
                        return false
                    }
                    console.log("rawData", rawData)
                    if (content != rawData) {
                        console.log("不相同")
                        swal({
                            icon: "warning",
                            title: "Do you want to save it?",
                            buttons: {
                                ok: "Save",
                                close: "Don't Save",
                                quit: "Close",
                            }
                        }).then((value) => {
                            switch (value) {
                                case "ok":
                                    console.log('confirm');
                                    fs.writeFile(path, content, (err) => {
                                        if (err) {
                                            console.log("err", err)
                                            swal({
                                                icon: "error",
                                                title: "The save failed",
                                                buttons: {
                                                    no: "Please try again",
                                                }
                                            })
                                            return false
                                        }
                                        console.log('文件已被保存');
                                        chromeTabs.removeTab(detail.tabEl)
                                        delData({id: tabId}, function() {
                                            initTabs()
                                        })
                                        swal({
                                            icon: "success",
                                            title: "The save was successful",
                                            buttons: {
                                                ok: "Confirm",
                                            }
                                        })
                                    });
                                    break
                                case "close":
                                    console.log('close')
                                    chromeTabs.removeTab(detail.tabEl)
                                    delData({id: tabId}, function() {
                                        initTabs()
                                    })
                                    break
                                case "quit":
                                    // 关闭操作 
                                    // 不需要代码
                                    console.log('close');
                                    break
                                default:
                                    
                                    break
                            }
                        })
                    } else {
                        chromeTabs.removeTab(detail.tabEl)
                        delData({id: tabId}, function() {
                            initTabs()
                        })
                    }
                })    
            }
        } else {
            chromeTabs.removeTab(detail.tabEl)
            delData({id: tabId}, function() {
                initTabs()
            })
        }
    })

    el.addEventListener('activeTabChange', function({ detail }) {
        console.log('Active tab changed', detail.tabEl)
        console.log("active id", $(".chrome-tabs-content").data("active"))
        let ele = detail.tabEl
        let tabId = ele.dataset.tabId
        console.log("tabId", tabId)
        if (findData({id: tabId}) != null) {
            let findedELe = findData({id: tabId})
            let fileName = findedELe.filename
            let path = findedELe.path
            let content = findedELe.content
            if (path != "") {
                fs.readFile(path, 'utf-8', (err, data) => {
                    if (err) {
                        removeCurTab()
                        console.log("err", err)
                        swal({
                            icon: "error",
                            title: "The file was lost",
                            text: "The file has been deleted",
                            buttons: {
                                yes: "Confirm",
                            }
                        })
                        return false
                    }
                    if (content != data) {
                        content = data
                    }
                    let title = fileName + " - Arena"
                    mainEditor.n.setValue(findedELe.content)
                    console.log("title", title)
                    // updateCurTab(findedELe.id)
                    // tab.find('.chrome-tab-title').text(filename)
                    $("#id-mac-title").text(title)
                })
            } else {
                    let title = fileName + " - Arena"
                    mainEditor.n.setValue(findedELe.content)
                    console.log("title", title)
                    // updateCurTab(findedELe.id)
                    // tab.find('.chrome-tab-title').text(filename)
                    $("#id-mac-title").text(title)
            }
        }
        $(".chrome-tabs-content").data("active", tabId)
        
    })
}

let fileMonitor = function(id, path) {
    fs.watch(path, (eventType, filename) => {
        if (filename) {
            console.log("+++", filename);
            // 文件改变了, 这个时候需要改变
            fs.readFile(path, 'utf-8', (err, data) => {
                if (err) {
                    console.log("err", err)
                    return false
                }
                let form = {
                    id: id,
                    content: data,
                }
                updateContent(form)
                let cur = curTab()
                // if (cur.id == id) {
                //     mainEditor.n.setValue(data)
                // }
            })
        }
    });
}
let initData = function() {
    // 初始化存放数据 
    // console.log("localStorage.genEditor", localStorage.genEditor)
    if (!localStorage.genEditor || localStorage.genEditor == "[]") {
        console.log("[]")
        localStorage.genEditor = "[]"
        // let defaultId = $(".chrome-tabs-content").data("active")
        let defaultData = {
            id: "0",
            path: "",
            filename: "New Tab",
            content: "",
        }
        $(".chrome-tabs-content").data("active", "0")
        let defaulGenEditor = JSON.parse(localStorage.genEditor)
        defaulGenEditor[0] = defaultData
        localStorage.genEditor = JSON.stringify(defaulGenEditor)
        chromeTabs.addTab({
            title: "New Tab",
            favicon: false,
            id: "0",
        })
    } else {
        console.log("load data")
        let all = JSON.parse(localStorage.genEditor)
        for (let i = 0; i < all.length; i++) {
            let ele = all[i]
            console.log("ele", ele)
            let filename = ele.filename
            let id = ele.id
            $(".chrome-tabs-content").data("active", id)
            let content = ele.content
            let path = ele.path
            try {
                fs.readFile(path, 'utf-8', (err, data) => {
                    if (err) {
                        console.log("err", err)
                        console.log("the path is changed")
                        delData({id: id}, null)
                        // pathChanged = true
                        if (allData().length == 0) {
                            chromeTabs.addTab({
                                title: "New Tab",
                                favicon: false,
                                id: maxId(),
                            })
                            let title = filename + " - Arena"
                            $("#id-mac-title").text(title)
                        }
                        return false
                    }
                    fileMonitor(id, path)
                    console.log("__readFile", data)
                    if (content != data) {
                        content = data
                    }
                    console.log("----id", id)
                    if (ele.path == "" && ele.content != "") {
                        chromeTabs.addTab({
                            title: filename,
                            favicon: false,
                            id: id,
                        })
                        mainEditor.n.setValue(content)
                        let title = filename + " - Arena"
                        $("#id-mac-title").text(title)
                    }
                    if (ele.path != "") {
                        chromeTabs.addTab({
                            title: filename,
                            favicon: false,
                            id: id,
                        })
                        mainEditor.n.setValue(content)
                        let title = filename + " - Arena"
                        $("#id-mac-title").text(title)
                    }
                    if (ele.path == "" && all.length == 0) {
                        chromeTabs.addTab({
                            title: filename,
                            favicon: false,
                            id: id,
                        })
                        mainEditor.n.setValue(content)
                        let title = filename + " - Arena"
                        $("#id-mac-title").text(title)
                    }
                })
            } catch (e) {
                console.log("e", e)
            }
            
            // if (pathChanged == false) {
                
            // }
            
            // if (i == 0) {
            //     let tab = $(".chrome-tab")
            //     tab.data("tabId", id) 
            //     $(".chrome-tab-title").text(filename)
            //     let title = filename + "- Arena"
            //     $("title").text(title)
            //     mainEditor.n.setValue(content)
            // } else {
            //     chromeTabs.addTab({
            //         title: filename,
            //         favicon: false,
            //         id: id,
            //     })
            //     mainEditor.n.setValue(content)
            // }
        }
    }   
}

let eidtorMonitor = function() {
    console.log("mainEditor", mainEditor.n)
    mainEditor.n.on("keyup", function() {
        console.log("keyup")
        let id = $(".chrome-tabs-content").data("active")
        updateDataById(id)
    })

    mainEditor.n.on("inputRead", function () {
        console.log("inputRead")
        // 获取用户当前的编辑器中的编写的代码
        var words = mainEditor.n.getValue() + "";
        console.log("words", words)
        // 利用正则取出用户输入的所有的英文的字母
        words = words.replace(/[a-z]+[\-|\']+[a-z]+/ig, '').match(/([a-z]+)/ig);
        // 将获取到的用户的单词传入CodeMirror,并在javascript-hint中做匹配
        console.log("new words", words)
        CodeMirror.ukeys = words;
        // 调用显示提示
        mainEditor.n.showHint();
    });
}

let dockOpenFile = function() {
    // let path = remote.getGlobal('fileToOpen')
    ipcRenderer.on('dock-file', (event, arg) => {
        console.log("dock-file", arg);
        let path = arg[0]
        let extensions = ['js', 'html', 'json', 'gen', 'txt'] 
        let type = path.split(".", 2).reverse()[0].toLowerCase()
        let i = extensions.indexOf(type);
        if (i != -1) {
            openFile(path)
        } else {
            swal({
                icon: "error",
                title: "File types are not supported",
                text: "Only: js html json gen txt",
                buttons: {
                    ok: "Confirm",
                }
            })
        }
    })
}

let newTitleBar = function() {
    $(".close").on("click", function() {
        console.log("close")
        ipcRenderer.send('close', 'close');
    })
    $(".minimize").on("click", function() {
        console.log("minimize")
        ipcRenderer.send('min', 'min');
    })
    $(".zoom").on("click", function() {
        console.log("zoom")
        ipcRenderer.send('max', 'max');
    })
    $(".run").on("click", function() {
        console.log("run")
        $("#button-run").click()
    })
    $(".new").on("click", function() {
        console.log("new")
        newTab()
    })
    $(".setting").on({
        click: function() {
            $("#menu").toggleClass("hidden")
        },
    });
    $(document).mouseup(function (e) {
        var con = $(".setting");   // 设置目标区域
        if (!con.is(e.target) && con.has(e.target).length === 0) {
            $("#menu").addClass("hidden")
        }
    });
    $("#id-title-new-file").on("click", function() {
        $("#menu").addClass("hidden")
        newTab()
    })
    $("#id-title-open-file").on("click", function() {
        $("#menu").addClass("hidden")
        OpenDialog()
    })
    $("#id-title-save-file").on("click", function() {
        $("#menu").addClass("hidden")
        let form = curTab()
        if (form.path == "") {
            console.log('保存新建文件', form)
            saveAnotherDialog(form, true)
        } else {
            console.log('保存, form', form)
            saveFile(form, true)
        }
    })
    $("#id-title-saveother-file").on("click", function() {
        $("#menu").addClass("hidden")
        let tab = curTab()
        console.log("另存为, tab", tab)
        saveAnotherDialog(tab)
    })
    $("#id-title-about").on("click", function() {
        $("#menu").addClass("hidden")
        ipcRenderer.send('about');
    })
    $("#id-title-find").on("click", function() {
        $("#menu").addClass("hidden")
        findInPage.openFindWindow()
    })
}

let newRightMenu = function() {
    let mainFocus = null
    let consoleFocus = null
    $(document).mouseup(function (e) {
        $("#id-right-click-menu").removeClass("clipper-show")
        $("#id-right-click-menu").addClass("clipper-hidden")
    });
    window.addEventListener('contextmenu', (e) => {
        console.log("mainEditor contextmenu hasFocus", mainEditor.n.hasFocus())
        console.log("MyConsole contextmenu hasFocus", MyConsole.hasFocus())
        mainFocus = mainEditor.n.hasFocus()
        consoleFocus = MyConsole.hasFocus()

        let drawing = document.querySelector(".CodeMirror")
        e.preventDefault();	    	
        // 获取菜单，让菜单显示出来
        var menu = document.getElementById("id-right-click-menu");
        // menu.classList.remove("hidden")
        $("#id-right-click-menu").removeClass("clipper-hidden")
        $("#id-right-click-menu").addClass("clipper-show")
        //  让菜单随着鼠标的移动而移动
        //  获取鼠标的坐标
        var x = e.clientX;
        var y = e.clientY;

        //  调整宽度和高度
        var rightedge = drawing.clientWidth - e.clientX;
        var bottomedge = drawing.clientHeight - e.clientY;
        if (rightedge < menu.offsetWidth) {
            menu.style.left = drawing.scrollLeft + e.clientX - menu.offsetWidth + "px";
        } else {
            menu.style.left = drawing.scrollLeft + e.clientX + "px";
        }
        if (bottomedge < menu.offsetHeight) {
            menu.style.top = drawing.scrollTop + e.clientY - menu.offsetHeight + - 50 + "px";
        } else {
            menu.style.top = drawing.scrollTop + e.clientY - 20 + "px";
        }
    }, false)


    $("#id-right-click-cut").on("click", function(event) {
        console.log("cut")
        console.log("mainEditor click hasFocus", mainEditor.n.hasFocus())
        console.log("MyConsole click hasFocus", MyConsole.hasFocus())
        $("#id-right-click-menu").removeClass("clipper-show")
        $("#id-right-click-menu").addClass("clipper-hidden")
        if (mainFocus != mainEditor.n.hasFocus()) {
            mainEditor.n.focus()
        }
        if (MyConsole.hasFocus() != consoleFocus) {
            MyConsole.focus()
        }
        ipcRenderer.send('asynchronous-message', 'cut');
    })

    $("#id-right-click-paste").on("click", function() {
        console.log("paste")
        $("#id-right-click-menu").removeClass("clipper-show")
        $("#id-right-click-menu").addClass("clipper-hidden")
        if (mainFocus != mainEditor.n.hasFocus()) {
            mainEditor.n.focus()
        }
        if (MyConsole.hasFocus() != consoleFocus) {
            MyConsole.focus()
        }
        ipcRenderer.send('asynchronous-message', 'paste');
    })

    $("#id-right-click-copy").on("click", function() {
        console.log("copy")
        $("#id-right-click-menu").removeClass("clipper-show")
        $("#id-right-click-menu").addClass("clipper-hidden")
        if (mainFocus != mainEditor.n.hasFocus()) {
            mainEditor.n.focus()
        }
        if (MyConsole.hasFocus() != consoleFocus) {
            MyConsole.focus()
        }
        ipcRenderer.send('asynchronous-message', 'copy');
    })

    $("#id-right-click-find").on("click", function() {
        console.log("find")
        findInPage.openFindWindow()
    })

    $("#id-right-click-run").on("click", function() {
        console.log("run")
        $("#button-run").click()
    })

    $("#id-right-click-console").on("click", function() {
        console.log("console")
        $("#traceBox").toggleClass("gen-hiddenBox")
        $("#traceBox").toggleClass("gen-showBox")
    })
}

let dragOpen = function() {
    const dragWrapper = document.querySelector('.page');
    dragWrapper.addEventListener("drop", (e)=>{
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length>=1){
            const path = files[0].path;
            console.log("file:", path);
            // const content = fs.readFileSync(path);
            // console.log(content.toString());
            openFile(path)
        }
    })
    //这个事件也需要屏蔽
    dragWrapper.addEventListener("dragover",(e)=>{
        e.preventDefault();
    })
}


let __mainRender = function() {
    // 编辑器初始化
    eidtorMonitor()
    // 初始化数据
    initData()
    // 初始化菜单
    newTitleBar()
    // setDockMenu()
    // 初始化右键菜单
    newRightMenu()
    // rightMenu()
    // 快捷键
    shortcut()
    // 退出检查
    quitCheck()
    // 监听事件
    chromeMonitor()
    // dock open 事件
    dockOpenFile()
    // drag open 事件
    dragOpen()
}

// 初始化
$(document).ready(function() {
    __mainRender()
});
