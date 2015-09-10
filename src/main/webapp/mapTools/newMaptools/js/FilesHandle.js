 function initDragDrop(){
    	var fileReader = new FileReader();
        var div = document.getElementById('b');
        div.ondragenter = div.ondragover = function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            return false;
        }
        div.ondrop = function (e) {
            var file = e.dataTransfer.files[0];
            if(file.size >  41457280){
                alert("only handle file no more than 30MB!!!");
            }
            else{
                fileReader.readAsText(file,"utf-8");
                fileName = file.name;
                fileType = parseFileType(fileName);
                fileReader.onload = function(e){
                    handleFile(file.name,this.result);
                }
            }
            
            e.preventDefault();
            return false;
        }
    }
 
 function parseFileType(fileName){
     var lowerFileName = fileName.toLowerCase();
     var csv = ".csv";
     var json = ".json";
     var geojson = ".geojson";
     if(lowerFileName.substring(lowerFileName.length - csv.length) == csv){
         return FileType.CSV;
     }else if(lowerFileName.substring(lowerFileName.length - json.length) == json || lowerFileName.substring(lowerFileName.length - geojson.length) == geojson){
         return FileType.JSON;
     }else{
         return FileType.Unknown;
     }
 }
     //var fileType = parseFileType(fileName);
 function handleFile(fileName,content){
     switch(fileType){
         case FileType.CSV : processCSVFile(fileName,content);break;
         case FileType.JSON : processJSONFile(fileName,content);break;
         default:alert("only supports json and csv file!!!");break;
     }
     
     if(roadsInJSON.length > 0 && roadsInfo.length > 0)
     {
     	 document.getElementById('b').ondrop = null; 
     }
               
     checkDuplicatedRoadName();
 }
 
 function processCSVFile(fileName,content){
 	var lines = content.split("\n");
 	for(var i = 0; i < lines.length - 1; i ++)
 	{
 		var line = lines[i];
 		var road = {};
 		if(line.trim() != "")
 		{
 			var roadArray = line.split(",");
 			if(isUpdation == 1)
 			{
 				road.id = parseInt(roadArray[0]);
 				roadsID[roadArray[2]] = road.id;
 			} else {
 				road.id = i - 1;
 			}
 			road.rate = roadArray[1];
 			road.name = roadArray[2];
 			road.nameEn = roadArray[3];
 			 
 		}
 		roadsInfo.push(road);
 	}
 	
 	createRoadList();
 }
 
 function generateBoundary(feature){
    var str = "POLYGON((";
    var coors = feature.geometry.coordinates[0];
    for(var i = 0; i < coors.length; i++){
        str += coors[i][0]+" "+coors[i][1];
        if(i != coors.length-1){
            str += ",";
        }
    }
    str += "))";
    boundary = wktReader.read(str);
 }
 function processJSONFile(fileName,content){
 	
     waysInfo = $.parseJSON(content);
     var bound = waysInfo.features[0];
     waysInfo.features.splice(0,1);
     generateBoundary(bound);
     var checkName = {};
     $.each(waysInfo.features, function(i, feature){
     	var wayType = feature.properties.highway;
     	//TODO: need mapping the wayType in a hash object
     	if(typeof(levelMapping[wayType]) != "undefined")
     	{
     		var r_name = feature.properties.way_name;
     		if(r_name != "" && !checkName[r_name])
     		{
     			checkName[r_name] = true;
     			var r = {};
     			r.name = r_name;
     			r.level = wayType;
     			roadsInJSON.push(r);
     		}
     	}
     });
    
     mergedWaysInformation();
     waysInfo.color = "#D4D4D4";
     drawObj(waysInfo, baseLayer, true);
     confirm("The JSON file is processed successfully!")
 }