let getFileName = function(path) {
    var index = path.lastIndexOf("/") 
    var fileName = path.substr(index + 1)
    return fileName;
}



module.exports = getFileName