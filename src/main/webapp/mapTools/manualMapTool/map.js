
/**
 * preprocess all roads, and combine the connected part of each road
 */
function preprocess(roadsInfos,waysInfos){
	var groupedWaysInfos = groupRoadWay(roadsInfos,waysInfos);
	var mergedWaysInfos = {};
	for(var roadName in groupedWaysInfos){
		if(roadName != ""){
			mergedWaysInfos[roadName] = combineWays(groupedWaysInfos[roadName]);
		}
	}
	console.log(mergedWaysInfos);
	mergedWaysInfos[""] = formatUnnamed(groupedWaysInfos[""]);

	// var count = 0;
	// for(var i = 0; i < roadsInfos.length;i++){
	// 	try{
	// 		if(mergedWaysInfos[roadsInfos[i].name].length <= 2){
	// 			count++;
	// 		}
	// 	}catch(e){
	// 		console.log(roadsInfos[i]);
	// 	}
	// }
	// console.log(roadsInfos.length+","+count);
	return mergedWaysInfos;
	
}

function mergeRoad(mergedWaysInfos,wayName,features){
	var copied = JSON.parse(JSON.stringify(mergedWaysInfos[wayName]));
	var originMerged = combineWays(features);
	remergeWays(copied,originMerged);
	var merged = selfMerge(copied);
	console.log({"merged":merged,"left":copied});
	for(var i = 0; i < merged.length; i++){
		toWKT(merged[i]);
	}
}

function selfMerge(copied){
	var merged = [];
	var len;
	function merge2(c,copied){
		var removedIndex = [];
		for(var i = 0; i < copied.length; i++){
			if(tryMerge(c,copied[i])){
				removedIndex.push(i);
			}
		}
		for(var i = removedIndex.length-1; i >= 0; i--){
			copied.splice(removedIndex[i],1);
		}
	}

	while(copied.length > 0){
		var c = copied[0];
		copied.splice(0,1);
		do{	
			len = copied.length;
			merge2(c,copied);
		}while(len > copied.length && copied.length > 0);
		merged.push(c);
	}
	return merged;
}

function first(coordinates){
	return coordinates[0];
}
function last(coordinates){
	return coordinates[coordinates.length-1];
}
function tryMerge(c,nc){
	var ret = false;
	if(equals(last(c.LineString),first(nc.LineString))){
		ret = true;
		c.features = c.features.concat(nc.features);
		nc.LineString.splice(0,1);
		c.LineString = c.LineString.concat(nc.LineString);
	}else if(equals(first(c.LineString),last(nc.LineString))){
		ret = true;
		c.features = nc.features.concat(c.features);
		nc.LineString.splice(nc.LineString.length-1,1);
		c.LineString = nc.LineString.concat(c.LineString);
	}
	return ret;
};

function remergeWays(copied,newCopied){
	var removedIndex = [];
	for(var i = 0; i < newCopied.length; i++){
		var nc = newCopied[i];
		for(var j = 0; j < copied.length; j++){
			if(tryMerge(copied[j],nc)){
				removedIndex.push(i);
				break;
			}
		}
	}
	for(var i = removedIndex.length-1; i >= 0; i--){
		newCopied.splice(removedIndex[i],1);
	}
}

function copyAsNewFeatures(features){
	var newCopied = [];
	for(var i = 0; i < features.length; i++){
		newCopied.push({"LineString":features[i].geometry.coordinates,"features":[features[i]],"flag":1});
	}
	return newCopied;
}

function formatUnnamed(features){
	var fs = [];
	for(var i = 0; i < features.length; i++ ){
		fs.push({"features":[features[i]],"LineString":features[i].geometry.coordinates});
	}
	return fs;
}
/**
 * group all way by road name
 */
function groupRoadWay(roadsInfos,waysInfos){
	var groupedWaysInfos = {};
	for(var i = 0; i < waysInfos.features.length; i++){
		pushWayInfo(groupedWaysInfos,waysInfos.features[i]);
	}

	return groupedWaysInfos;
}

function pushWayInfo(groupedWaysInfos,feature){
	var name = feature.properties.way_name;
	if(groupedWaysInfos[name] == undefined){
		groupedWaysInfos[name] = [];
	}
	groupedWaysInfos[name].push(feature);
}

function makeNewCombined(feature){
	var combined = {
		"features":[],
		"start":[],
		"end":[]
	};
	combined.features.push(feature);
	combined.start = feature.geometry.coordinates[0];
	combined.end = feature.geometry.coordinates[feature.geometry.coordinates.length - 1];
	
	return combined;
}
/**
 * v1
 */
function combineWays(waysFeatureInfos){
	
	var merged = [];
	var copied = copy(waysFeatureInfos);
	while(copied.length>0){
		var c = copied[0];
		copied.splice(0,1);
		var len;
		do{
			len = copied.length;
			merge(c,copied);
		}while(len > copied.length && copied.length > 0);
		
		merged.push(generateMergedWaysInfo(c));
	}


	return merged;
}

function generateMergedWaysInfo(c){
	var obj = {};
	obj.features = c.features;
	obj.LineString = [];
	for(var i = 0; i < c.features.length;i++){
		obj.LineString = obj.LineString.concat(c.features[i].geometry.coordinates); 
	}
	return obj;
}


function merge(combined,copied){
	if(copied.length <= 0){
		return false;
	}
	var removedIndex = [];
	for(var i = 0; i < copied.length; i++){
		if(combine(combined,copied[i])){
			removedIndex.push(i);
		}
	}
	var ret = removedIndex.length > 0;

	for(var i = removedIndex.length-1; i >= 0; i-- ){
		copied.splice(removedIndex[i],1);
	}
	return ret;
}


function combine(combined,feature2){
	var ret = false;
	if(equals(combined.end,feature2.start)){
		ret = true;
		combined.features = combined.features.concat(feature2.features);
		combined.end = feature2.end;
	}
	else if(equals(combined.start,feature2.end)){
		ret = true;
		combined.features = feature2.features.concat(combined.features);
		combined.start = feature2.start;
	}
	return ret;
}

function equals(coor1,coor2){
	return approximateEquals(coor1[0],coor2[0]) && approximateEquals(coor1[1],coor2[1]);
}

function approximateEquals(v1,v2){
	return Math.abs(v1-v2) < 0.00009;
}


function copy(waysFeatureInfos){
	var copied = [];
	for(var i = 0; i < waysFeatureInfos.length;i++){
		copied.push(makeNewCombined(waysFeatureInfos[i]));
	}
	return copied;
}

function toWKT(combined){
	var geojson = {"type":"FeatureCollection","features":[]};
	var coordinates = [];
	for(var i = 0; i < combined.features.length;i++){
		coordinates = coordinates.concat(combined.features[i].geometry.coordinates); 
	}

	geojson.features.push({"type":"Feature","geometry":{"type":"LineString","coordinates":coordinates}});
	console.log(JSON.stringify(geojson)+"\n");
}
