/*
 * 该示例主要流程分为三个步骤
 * 1. 首先调用公交路线查询服务(lineSearch)
 * 2. 根据返回结果解析，输出解析结果(lineSearch_Callback)
 * 3. 在地图上绘制公交线路()
 */
var resLine  = ''; //结果表格对象

var map = new AMap.Map("mapContainer", {
	resizeEnable: true,
    view: new AMap.View2D({
    center:new AMap.LngLat(116.397428,39.90923),//地图中心点
    zoom:13 //地图显示的缩放级别
    })
});

/*
 *清空地图覆盖物与查询结果
 */
function mapclear() {
    btContent = '';
    resLine   = '';
    map.clearMap();
}

/**
 * 在地图上画出所有点
 * 
 * @param arr
 * 			点坐标集合[[lng, lat], [lng, lat], ...]
 */
function addMarker(arr) {
	for(var i = 0 ; i < arr.length ; i++) {
		marker = new AMap.Marker({
			icon: "http://webapi.amap.com/images/marker_sprite.png",
			position: [arr[i][0], arr[i][1]]
		});
		marker.setMap(map); // 在地图上添加点
	}

	map.setFitView(); // 调整到合理视野
}

/**
 * 通过读取textarea里公交线路名称搜索
 */
function searchAll() {
	var list = $("#roadNames").val();
	list = dismissNewline(list);
	console.log(list);
	var nameList = list.split(",");
	for(var i = 0 ; i < nameList.length ; i++) {
		lineSearch(nameList[i]);
	}
}

function download() {
	downloadFile("roadList.csv", roadList);
	downloadFile("stationList.csv", stationList);
	downloadFile("unfoundList.csv", unfoundList);
}

var roadList = "#ROAD_ID,ROAD_NAME,LINESTR\n";
var stationList = "#STATION_ID,ROAD_ID,STATION_NAME,SEQ\n";
var unfoundList = "";

/**
 * "LINESTRING(118.620915 31.794080,118.621197 31.793526)"
 */
function toLinestr(item) {
	var res = "LINESTRING(";
	for(var i = 0 ; i < item.length ; i++) {
		res += item[i].lng + " " + item[i].lat + ",";
	}
	res = res.substring(0, res.length - 1);
	res += ")"
	return res;
}

function toCoordinates(item) {
	var res = [];
	for(var i = 0 ; i < item.length ; i++) {
		var tmp = [];
		tmp[0] = item[i].lat;
		tmp[1] = item[i].lng;
		res.push(tmp);
	}
	return res;
} 

/*
 *公交线路查询
 */
function lineSearch(roadLineName) {
    //加载公交线路查询插件
    //实例化公交线路查询类，只取回一条路线
    AMap.service(["AMap.LineSearch"], function() {
       var linesearch = new AMap.LineSearch({
            pageIndex:1,
            city:'南京',
            pageSize:1,
            extensions:'all'
        });
       
        linesearch.search(roadLineName, function(status, result){
        	 console.log(JSON.stringify(result));
        	if(status === 'complete' && result.info === 'OK'){
        		for(var i = 0 ; i < result.lineInfo.length ; i++) {
        			roadList += result.lineInfo[i].id + ",";
        			roadList += "\"" + result.lineInfo[i].name + "\"" + ",";
        			roadList += "\"" + toLinestr(result.lineInfo[i].path)+ "\"" + "\n";
//        			console.log(result.lineInfo[i].via_stops);
        			//经过的站台信息
        			for(var j = 0 ; j < result.lineInfo[i].via_stops.length ; j++) {
        				stationList += "\"" + result.lineInfo[i].via_stops[j].id + "\"" + ",";
        				stationList += result.lineInfo[i].id + ",";
        				stationList += "\"" + result.lineInfo[i].via_stops[j].name+ "\"" + ",";
        				stationList += result.lineInfo[i].via_stops[j].sequence+ "\n";
        			}
        		}
        		
        		
        	}else{
        		unfoundList += roadLineName + ",\n";
        	}
        });
    });
}

var testList = "123路拥军线:悦民路,麒麟门新大街,锦绣花园,麒麟山庄,西村,东郊小镇,晨光,金丝岗,孟庄,锁石村,孟北,坟头,候家塘,黄栗墅,张肖庄西站,张肖庄,汤山溶洞,汤山西站,汤山中学,汤山站,汤山东站,陈达村,汤山汽运六队,作厂,南京炮院站,经三路,西营房,新北路,东营房";

var stationsMap = new HashMap();

/**
 * 公交线路，数组对象，其中lines[0]为线路名称，如["123路拥军线", "悦民路", "麒麟门新大街", ...]
 * 
 * @param nameList
 */
function batchStationSearch(nameList) {
	var stationName;
	//查询内存中是否存在该公交站点名称，若没有则向高德API发起请求
	for(var i = 1 ; i < nameList.length ; i++) {
		if(stationsMap.containsKey(nameList[i])) {
			var st = stationsMap.get(nameList[i]);
			//在地图上画出该站点的所有位置
			addMarker(getPoints(st));
		} else {
			stationSearch(nameList[i]);
			
		}
	}
	//获取站点详细信息
}

function singleStationSearch(name) {
	var stationName;
	//查询内存中是否存在该公交站点名称，若没有则向高德API发起请求
	for(var i = 1 ; i < nameList.length ; i++) {
		if(stationsMap.containsKey(nameList[i])) {
			var st = stationsMap.get(nameList[i]);
			//在地图上画出该站点的所有位置
			addMarker(getPoints(st));
		} else {
			stationSearch(nameList[i]);
			
		}
	}
	//获取站点详细信息
}

function stationSearchCallBak(name, st) {
	stationsMap.put(name, st);
	addMarker(getPoints(st));
}

/**
 * 获取站点详细信息
 * 
 * @param stationName	
 * 			公交站点名称，这里是要匹配的名称
 * @param lines
 * 			公交线路，数组对象，其中lines[0]为线路名称，如["123路拥军线", "悦民路", "麒麟门新大街", ...]
 * @param stationObj
 * 			根据stationName从高德API中检索返回的结果
 */
function extractDetail(stationName, lines, stationObj) {
	//先从高德stationObj中获取路线匹配的所有结果集
	var linesMatched = [];
	var buslines = stationObj.stationInfo[0].buslines;
	for(var i = 0 ; i < buslines.length ; i++) {
		//对于一个line，获取高德lineInfo对象
		
	}
}

/**
 * 公交站点查询服务，根据输入关键字查询公交站点信息。
 * 
 * @param stationName
 */
var stationtest ;
function stationSearch(stationName) {
	
    var MSearch;
    AMap.service(["AMap.StationSearch"], function() {        
        MSearch = new AMap.StationSearch({ //构造地点查询类
            pageSize:10,
            pageIndex:1,
            city:"南京" //城市
        });
        console.log("in");
        //关键字查询
        MSearch.search(stationName, function(status, result){
        	console.log(JSON.stringify(result));
        	stationtest = result;
        	if(status === 'complete' && result.info === 'OK'){
        		stationSearchCallBak(stationName, result);
        	}
        }); 
    });
}

function Stations() {
	/**
	 * 存放从高德地图API里stationSearch的结果
	 * 
	 */
	this.map = new HashMap();
	
}

function Lines() {
	/**
	 * 存放从高德地图API里lineSearch的结果
	 * 
	 */
	this.map = new HashMap();
}

/**
 * 返回高德API stationInfo对象中第一条buslines的所有不同点
 * 
 * @param st
 * @returns {Array}
 */
function getPoints(st) {
	var buslines = st.stationInfo[0].buslines;
	var points = [];
	for(var i = 0 ; i < buslines.length ; i++) {
		var tmpPoint = [buslines[i].location.lng, buslines[i].location.lat];
		var hasP = false;
		for(var j = 0 ; j < points.length ; j++) {
			if(points[j][0] == tmpPoint[0] && points[j][1] == tmpPoint[1]) {
				hasP = true;
				break;
			}
		}
		if(!hasP) {
			points.push(tmpPoint);
		}
		
	}
	return points;
}

function Line() {
	
}