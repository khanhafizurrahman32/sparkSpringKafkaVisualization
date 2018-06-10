var localFileNamePersistence = (function(){
  var file_name = "";

  var getFileName = function(){
    //console.log(file_name);
    return file_name;
  };

  var setFileName = function(name){
    //console.log(name);
    file_name = name;
    //console.log(name);
  };

  return {
    getFileName: getFileName,
    setFileName: setFileName
  }

})()

export default localFileNamePersistence;
