function randomHexColor() {  
    var rand = Math.floor(Math.random( ) * 0xFFFFFF).toString(16);  
    if(rand.length == 6){  
        return "#"+rand;  
    }else{  
        return randomHexColor();  
    }  
}

function wkt2GeoJson(wkt){
	var obj = wktReader.read(wkt)
	var g = parser.write(obj);
	var gType = g.CLASS_NAME;
	var features = [];
	if(gType == "OpenLayers.Geometry.Point"){
		var feature =  { "type": "Feature",
	      "geometry": { "type": "Point", "coordinates": [g.x, g.y] },
	      "properties": {}
	      };
		features.push(feature);
	}else if(gType == "OpenLayers.Geometry.MultiPoint" ){
		var coordinates = g.components;
		var points = [];
		for(var i = 0; i < coordinates.length;i++){
			points.push([coordinates[i].x, coordinates[i].y]);
		}

		var feature =  { "type": "Feature",
		      "geometry": { "type": "MultiPoint", "coordinates": points },
		      "properties": {}
		      };
		features.push(feature);

	}else if(gType == "OpenLayers.Geometry.LineString"){
		var coordinates = g.components;
		var points = [];
		for(var i = 0; i < coordinates.length;i++){
			points.push([coordinates[i].x, coordinates[i].y]);
		}

		var feature =  { "type": "Feature",
		      "geometry": { "type": "LineString", "coordinates": points },
		      "properties": {}
		      };
		features.push(feature);

	}else if(gType == "OpenLayers.Geometry.MultiLineString"){
		var lineStringArray = g.components;
		for(var i = 0; i < lineStringArray.length;i++){
			var lineString = lineStringArray[i];
			var coordinates = lineString.components;
			var points = [];
			for(var j = 0; j < coordinates.length;j++){
				points.push([coordinates[j].x, coordinates[j].y]);
			}

			var feature =  { "type": "Feature",
			      "geometry": { "type": "LineString", "coordinates": points },
			      "properties": {}
			      };
			features.push(feature);
		}
		
	}else if(gType == "OpenLayers.Geometry.Polygon"){
		var pointsArray = g.components;
		var polygonPoints = [];
		for(var i = 0; i < pointsArray[0].components.length;i++){
			var p = pointsArray[0].components[i];
			polygonPoints.push([p.x,p.y]);
		}
		var holesArray = [];

		for(var i = 1; i < pointsArray.length; i++){
			var holePoints = [];
			for(var j = 0; j < pointsArray[i].components.length;j++){
				var p = pointsArray[i].components[j];
				holePoints.push([p.x,p.y]);
			}
			holesArray.push(holePoints)
		}
		var coordinates = [];
		coordinates.push(polygonPoints);
		for(var i = 0; i < holesArray.length; i++){
			coordinates.push(holesArray[i]);
		}
		var feature =  { "type": "Feature",
			      "geometry": { "type": "Polygon", "coordinates": coordinates },
			      "properties": {}
		      };
		features.push(feature);

	}else if(gType == "OpenLayers.Geometry.MultiPolygon"){
		var components = g.components;
		for(var k = 0; k < components.length;k++){
			var pointsArray = components[k].components;
			var polygonPoints = [];
			for(var i = 0; i < pointsArray[0].components.length;i++){
				var p = pointsArray[0].components[i];
				polygonPoints.push([p.x,p.y]);
			}
			var holesArray = [];

			for(var i = 1; i < pointsArray.length; i++){
				var holePoints = [];
				for(var j = 0; j < pointsArray[i].components.length;j++){
					var p = pointsArray[i].components[j];
					holePoints.push([p.x,p.y]);
				}
				holesArray.push(holePoints)
			}
			var coordinates = [];
			coordinates.push(polygonPoints);
			for(var i = 0; i < holesArray.length; i++){
				coordinates.push(holesArray[i]);
			}
			var feature =  { "type": "Feature",
				      "geometry": { "type": "Polygon", "coordinates": coordinates },
				      "properties": {}
			      };
			features.push(feature);
		}
	}
	var geoJson = {};
	geoJson.type = "FeatureCollection";
	geoJson.features = features;
	console.log(g);
	return geoJson;
}



function tileToCoordinatesArray(tileX,tileY,zoom){
	var coordinates = [];
	var topLeft = tile2Coordinate(tileX,tileY,zoom);
	var rightBottom = tile2Coordinate(tileX+1,tileY+1,zoom);
	coordinates.push([topLeft.lon,topLeft.lat]);
	coordinates.push([rightBottom.lon,topLeft.lat]);
	coordinates.push([rightBottom.lon,rightBottom.lat]);
	coordinates.push([topLeft.lon,rightBottom.lat]);
	coordinates.push([topLeft.lon,topLeft.lat]);
	return coordinates;
}

function convertCSVFile2JSON(fileName,content){
	var result = {
		"ErrCode":0,
		"ErrDesc":"",
		"json":null
	};
	var lines = content.split("\n");
	if(lines.length <= 0 ){
		result.ErrCode = 1;
		result.ErrDesc = "file is empty!!!";
		return result;
	}
	var columns = lines[0].split(",");
	if(columns.length <= 0 ){
		result.ErrCode = 1;
		result.ErrDesc = "first line is empty!!!";
		return result;
	}
	var zoom = parseZoomLevel(fileName);
	if(zoom <= 0){
		result.ErrCode = 1;
		result.ErrDesc = "file name must contain zoom level!!!";
		return result;
	}
	switch(columns.length){
		//case 3 : break;
		case 4 : result.json = parseTazCsv(lines,zoom);break;
		default: {
			result.ErrCode = 1;
			result.ErrDesc = "only suport taz format csv(tilex,tiley,center_tilex,center_tiley)";
		}break;
	}
	
	return result;
}

function parseZoomLevel(fileName){
	var zoom = -1;
	var zz = fileName.replace(/[^\d.]/g,'');
	if(zz.length > 0){
		zz = zz.substr(0,zz.length-1);
		if(!isNaN(zz)){
			zoom = parseFloat(zz);
		}
	}
	return zoom;
}

function parseTazCsv(lines,zoom){
	var json = {"type": "FeatureCollection","features":[]};
	var coordinates = [];
	var lastId = null;
	for(var i = 0; i < lines.length;i++){
		var line = lines[i].trim();
		if(line.length == 0){
			continue;
		}

		var columns = line.split(",");
		if(columns.length != 4){
			console.log("Error line:"+line);
			continue;
		}
		var id = columns[2]+"_"+columns[3];
		if(lastId != id){
			if(lastId != null && coordinates.length > 0){
				var geometry = {
					"type" : "PolygonTile",
					"coordinates" : []
				};
				geometry.coordinates.push(coordinates);
				var feature = {
					"type" : "Feature",
					"id" : lastId,
					"properties" : {
						"zoom":zoom,
						"id":lastId,
						"merge":true,
						"clusterId":lastId
					},
					"geometry" : geometry
				};
				json.features.push(feature);
				var centers = lastId.split("_");
				var centerPoint = createTileCenterFeature(centers[0],centers[1],zoom);
				centerPoint.properties.clusterId = lastId;
				json.features.push(centerPoint);
				coordinates = [];
			}

			lastId = id;
		}
		coordinates.push([parseInt(columns[0]),parseInt(columns[1])]);
	}

	if(lastId != null && coordinates.length > 0){
		var geometry = {
			"type" : "PolygonTile",
			"coordinates" : []
		};
		geometry.coordinates.push(coordinates);
		var feature = {
			"type" : "Feature",
			"id" : lastId,
			"properties" : {
				"zoom":zoom,
				"id":lastId,
				"merge":true,
				"clusterId":lastId
			},
			"geometry" : geometry
		};
		json.features.push(feature);
		var centers = lastId.split("_");
		var centerPoint = createTileCenterFeature(centers[0],centers[1],zoom);
		centerPoint.properties.clusterId = lastId;
		json.features.push(centerPoint);
	}
	return json;
}

function createTileCenterFeature(tileX,tileY,zoom){
	tileX = parseInt(tileX);
	tileY = parseInt(tileY);
	var topLeft = tile2Coordinate(tileX,tileY,zoom);
	var rightBottom = tile2Coordinate(tileX+1,tileY+1,zoom);
	var geometry = {
			"type" : "Point",
			"coordinates" : [(topLeft.lon+rightBottom.lon)/2,(topLeft.lat+rightBottom.lat)/2]
		};
	var feature = {
		"type" : "Feature",
		"properties" : {
			
		},
		"geometry" : geometry
	};
	return feature;
}





//=====================================================================
//String
//=====================================================================

String.format = function(p_string, p_args)
{
    if (p_string == null)
    {
        return "";
    }
    if (typeof(p_string) != "string")
    {
        p_string = p_string.toString();
    }
    if (p_args == null)
    {
        return p_string;
    }
    
    if (typeof(p_args) == "number")
    {
        var result = new Array(p_args);
        for (var i = 0; i < result.length; i++)
        {
            result[i] = p_string;
        }
        return result.join("");
    }
    
    var result = p_string;
    if (p_string.indexOf("{") != -1 && p_string.indexOf("}") != -1)
    {
        if (isArray(p_args) || isPlainObject(p_args))
        {
            for (var i in p_args)
            {
                result = result.replace("{" + i + "}", p_args[i]);
            }
        }
    }
    return result;
};



String.prototype.contains = function(p_subString)
{
    return this.indexOf(p_subString) != -1;
};

String.prototype.startsWith = function(p_string)
{
    return this.substring(0, p_string.length) == p_string;
};

String.prototype.endsWith = function(p_string)
{
    return this.substring(this.length - p_string.length) == p_string;
};

String.prototype.trimLeft = function()
{
    return this.replace(/^\s*/, "");
};

String.prototype.trimRight = function()
{
    return this.replace(/\s*$/, "");
};

String.prototype.trim = function()
{
    return this.trimRight().trimLeft();
};
