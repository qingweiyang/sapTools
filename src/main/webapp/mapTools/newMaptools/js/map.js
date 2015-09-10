
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

	return mergedWaysInfos;	
}

function mergeRoad(mergedWaysInfos,wayName,features){
	var copied = JSON.parse(JSON.stringify(mergedWaysInfos[wayName]));
	var originMerged = combineWays(features);
	remergeWays(copied,originMerged);
	var merged = selfMerge(copied);
	return {"merged":merged,"left":copied};
}

function checkSameNameWays(mergedWayInfo){
	var boundsArr = [];
	for(var i = 0; i < mergedWayInfo.length; i++){
		var b = calcWayBoundaryBox(mergedWayInfo[i]);
		b.index = [i];
		boundsArr.push(b);
	}

	var results = [];
	var len;
	while(boundsArr.length > 0){
		var b = boundsArr[0];
		boundsArr.splice(0,1);

		do{
			len = boundsArr.length;
			var removedIndex = [];
			for(var i = 0; i < boundsArr.length; i++){
				if(isSameRoad(b,boundsArr[i])){
					removedIndex.push(i);
					b = mergeBoundary(b,boundsArr[i]);
				}
			}
			for(var i = removedIndex.length-1; i >= 0;i--){
				boundsArr.splice(removedIndex[i],1);
			}
		}while(len > boundsArr.length && boundsArr.length > 0);
		
		results.push(b);
	}
	var arr = [];
	for(var i = 0; i < results.length; i++){
		var ws = [];
		for(var j = 0; j < results[i].index.length; j++){
			ws.push(mergedWayInfo[results[i].index[j]]);
		}
		if(checkWayInBoundary(ws)){
			arr.push(ws);
		}
	}
	// order
	if(arr.length > 1)
	{
		arr = orderWayByDistance(arr);
	}
	return arr;
}
function orderWayByDistance(arr){
	function calcWayBoundDis(way){
		var factory = new jsts.geom.GeometryFactory(new jsts.geom.PrecisionModel(jsts.geom.PrecisionModel.FLOATING));
		var bound = {
		"left":200,
		"right":-200,
		"top":-100,
		"bottom":100
		};
		for(var i = 0; i < way.length; i++){
			var o = way[i];
			for(var j = 0; j < o.LineString.length; j++){
				var coor = o.LineString[j];
				bound.left = Math.min(bound.left,coor[0]);
				bound.right = Math.max(bound.right,coor[0]);
				bound.top = Math.max(bound.top,coor[1]);
				bound.bottom = Math.min(bound.bottom,coor[1]);
			}
		}
		var lsBound = wktReader.read(bound2WKT(bound));
		
		return boundary.getCentroid().distance(lsBound);
	}
	var res = [];
	var dis = [];
	for(var i = 0; i < arr.length; i++){
		dis.push({"dis":calcWayBoundDis(arr[i]),"index":i});
	}
	dis.sort(function(a,b){return a.dis - b.dis;});
	for(var i = 0; i < dis.length; i++){
		res.push(arr[dis[i].index]);
	}
	return res;
}
function checkWayInBoundary(ws){
	
	for(var i = 0; i < ws.length; i++){
		var startPArr = ws[i].LineString[0];
		var endPArr = ws[i].LineString[ws[i].LineString.length-1];
		var start = new jsts.geom.Point(new jsts.geom.Coordinate(startPArr[0],startPArr[1]));
		var end = new jsts.geom.Point(new jsts.geom.Coordinate(endPArr[0],endPArr[1]));
		var r1 = boundary.contains(start);
		var r2 = boundary.contains(end);
		if(r1 && r2){
			return true;
		}
	}
	
	return false;
}

function mergeBoundary(b,b2){
	b.left = Math.min(b.left,b2.left);
	b.right = Math.max(b.right,b2.right);

	b.bottom = Math.min(b.bottom,b2.bottom);
	b.top = Math.max(b.top,b2.top);
	b.index = b.index.concat(b2.index);
	return b;
}
function bound2WKT(b){
	var str = "POLYGON((";
	str += b.left + " " + b.bottom+",";
	str += b.right + " " + b.bottom+",";
	str += b.right + " " + b.top+",";
	str += b.left + " " + b.top+",";
	str += b.left + " " + b.bottom+"))";
	return str;
}

function checkBoundInside(b1,b2){
	var bp1 = wktReader.read(bound2WKT(b1));
	var bp2 = wktReader.read(bound2WKT(b2));
	return bp1.intersects(bp2);
}
function isSameRoad(b,b2){
	// var MAX_DIS = 8000;
	// var same = calcDistanceOf2Bound(b,b2) <= MAX_DIS;
	// if(!same){
	// 	same = checkBoundInside(b,b2);
	// }
	// if(!same){
	// 	var xd = calcXDistance(b,b2);
	// 	var yd = calcYDistance(b,b2);
	// 	same = Math.max(xd,yd) < MAX_DIS;
	// }
	// if(!same){
	// 	console.log("b1 "+bound2WKT(b));
	// 	console.log("b2 "+bound2WKT(b2));
	// 	console.log(same);
	// }
	var bp1 = wktReader.read(bound2WKT(b));
	var bp2 = wktReader.read(bound2WKT(b2));
	var dis = bp1.distance(bp2);
	
	return dis <= 0.1;
}

// calculcate center distance of two recentage boundary(in meters)
function calcDistanceOf2Bound(bound1,bound2){
	var lng1 = (bound1.left+bound1.right)/2;
	var lat1 = (bound1.top+bound1.bottom)/2;

	var lng2 = (bound2.left+bound2.right)/2;
	var lat2 = (bound2.top+bound2.bottom)/2;

	return calcDistance(lng1,lat1,lng2,lat2);
}

function calcXDistance(b,b2){
	var l,r;
	if(b.left < b2.left){
		l = b;
		r = b2;
	}else{
		l = b2;
		r = b;
	}
	var xDis = calcDistance(l.right,l.top,r.left,l.top);
	return xDis;
}

function calcYDistance(b,b2){
	var bot,top;
	if(b.top < b2.bottom){
		bot = b;
		top = b2;
	}else{
		bot = b2;
		top = b;
	}
	var yDis = calcDistance(top.left,bot.top,top.left,top.bottom);
	return yDis;
}



// calculcate center distance of two recentage boundary(in meters)
function calcCenterDistanceOf2Bound(bound1,bound2){
	var lng1 = (bound1.left+bound1.right)/2;
	var lat1 = (bound1.top+bound1.bottom)/2;

	var lng2 = (bound2.left+bound2.right)/2;
	var lat2 = (bound2.top+bound2.bottom)/2;

	return calcDistance(lng1,lat1,lng2,lat2);
}


var FINAL = 6378137.0  
          
/** 
 * 求某个经纬度的值的角度值 
 * @param {Object} d 
 */  
function calcDegree(d){  
    return d*Math.PI/180.0 ;  
}  
  
/** 
 * 根据两点经纬度值，获取两地的实际相差的距离 
 */  
function calcDistance(lng1,lat1,lng2,lat2){  
    var flat = calcDegree(lat1) ;  
    var flng = calcDegree(lng1) ;  
    var tlat = calcDegree(lat2) ;  
    var tlng = calcDegree(lng2)  ;  
      
    var result = Math.sin(flat)*Math.sin(tlat) ;  
    result += Math.cos(flat)*Math.cos(tlat)*Math.cos(flng-tlng) ;  
    return Math.acos(result)*FINAL ;  
}  
function calcWayBoundaryBox(way){
	var bound = {
		"left":200,
		"right":-200,
		"top":-100,
		"bottom":100
	};

	for(var i = 0; i < way.LineString.length;i++){
		var coor = way.LineString[i];
		bound.left = Math.min(bound.left,coor[0]);
		bound.right = Math.max(bound.right,coor[0]);
		bound.top = Math.max(bound.top,coor[1]);
		bound.bottom = Math.min(bound.bottom,coor[1]);
	}
	return bound;
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

function first(c){
	return c.features[0].properties.endpointInfo.from.nodeId;
}

function firstDirection(c){
	return c.features[0].properties.endpointInfo.direction;
}
function last(c){
	return c.features[c.features.length-1].properties.endpointInfo.to.nodeId;
}

function lastDirection(c){
	return c.features[c.features.length-1].properties.endpointInfo.direction;
}
function tryMerge(c,nc){
	var ret = false;
	// if(last(c) == first(nc) && lastDirection(c) == firstDirection(nc)){
	// 	ret = true;
	// 	c.features = c.features.concat(nc.features);
	// 	nc.LineString.splice(0,1);
	// 	c.LineString = c.LineString.concat(nc.LineString);
	// }else if(first(c) == last(nc) && firstDirection(c) == lastDirection(nc)){
	// 	ret = true;
	// 	c.features = nc.features.concat(c.features);
	// 	nc.LineString.splice(nc.LineString.length-1,1);
	// 	c.LineString = nc.LineString.concat(c.LineString);
	// }
	if(last(c) == first(nc) && testCanMerge(c,nc)){
		ret = true;
		c.features = c.features.concat(nc.features);
		nc.LineString.splice(0,1);
		c.LineString = c.LineString.concat(nc.LineString);
	}else if(first(c) == last(nc) && testCanMerge(c,nc)){
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

function parseWayNodeInfo(pro){
	var from_nd = pro.from_nd;
	var to_nd = pro.to_nd;
	function parseInfo(n){
		var arr = n.split(" ");
		return {"nodeId":arr[0],"point":JSON.parse(arr[1])};
	}
	var from = parseInfo(from_nd);
	var to = parseInfo(to_nd);
	if(from.nodeId == to.nodeId){
		//console.error("start node equals to end node == " + JSON.stringify(pro));
	}
	return {"from": from,"to": to,"direction":pro.direction};
}

function pushWayInfo(groupedWaysInfos,feature){
	var name = feature.properties.way_name;
	feature.properties.endpointInfo = parseWayNodeInfo(feature.properties);
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
	combined.start = feature.properties.endpointInfo.from.nodeId;
	combined.end = feature.properties.endpointInfo.to.nodeId;
	combined.direction = feature.properties.endpointInfo.direction;
	
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

function testCanMerge(c1,c2){
		var cm = false;
		if(last(c1) == first(c2)){
			var s = c1.features[c1.features.length-1];
			var e = c2.features[0];
			if(s.properties.way_id != e.properties.way_id){
				var c1 = s.geometry.coordinates[s.geometry.coordinates.length-1];
				var c2 = e.geometry.coordinates[0];
				var c3 = e.geometry.coordinates[e.geometry.coordinates.length-1];
				var d1 = calcDistance(c1[0],c1[1],c2[0],c2[1]);
				var d2 = calcDistance(c1[0],c1[1],c3[0],c3[1]);
				cm = (d1 < d2);
			}
		}else if(first(c1) == last(c2)){
			var e = c1.features[0];
			var s = c2.features[c2.features.length-1];

			if(s.properties.way_id != e.properties.way_id){
				var c1 = s.geometry.coordinates[s.geometry.coordinates.length-1];
				var c2 = e.geometry.coordinates[0];
				var c3 = e.geometry.coordinates[e.geometry.coordinates.length-1];
				var d1 = calcDistance(c1[0],c1[1],c2[0],c2[1]);
				var d2 = calcDistance(c1[0],c1[1],c3[0],c3[1]);
				cm = (d1 < d2);
			}
		}
		return cm;
};

function combine(combined,feature2){
	
	var ret = false;
	// if(combined.end == feature2.start && combined.direction == feature2.direction){
	// 	ret = true;
	// 	combined.features = combined.features.concat(feature2.features);
	// 	combined.end = feature2.end;
	// }
	// else if(combined.start == feature2.end&& combined.direction == feature2.direction){
	// 	ret = true;
	// 	combined.features = feature2.features.concat(combined.features);
	// 	combined.start = feature2.start;
	// }

	if(combined.end == feature2.start && testCanMerge(combined,feature2)){
		ret = true;
		combined.features = combined.features.concat(feature2.features);
		combined.end = feature2.end;
	}
	else if(combined.start == feature2.end && testCanMerge(combined,feature2)){
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
