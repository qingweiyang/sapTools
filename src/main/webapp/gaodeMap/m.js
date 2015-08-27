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
    center:new AMap.LngLat(118.774212, 32.030774),//地图中心点
    zoom:11 //地图显示的缩放级别
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
function addMarker(obj) {
//	var markers = [];
	for(var i = 0 ; i < obj.length ; i++) {
		var marker = new AMap.Marker({
			map: map,
			icon: "http://webapi.amap.com/images/marker_sprite.png",
			position: obj[i].lnglat
		});
		
		//当触发mouseover事件时,换个皮肤
//		AMap.event.addListener(marker,"mouseover",function(){
//			console.log(marker);
//		    console.log("mouseover");
//		});
//		//当触发mouseout事件时,换回皮肤
//		AMap.event.addListener(marker,"mouseout",function(){
//		 
//		    console.log("mouseout");
//		});
		
		var info = [];    
		info.push("站台名称 ： " + obj[i].stationName);
		info.push("<div class='line'></div>");
		info.push("  lng,lat : " + marker.getPosition().lng + "," + marker.getPosition().lat);  
		info.push("<div class='line'></div>");
		info.push("经过的路线 ： " + obj[i].lines.join(","));
		               
		var inforWindow = new AMap.InfoWindow({                 
			offset:new AMap.Pixel(0,-23),                 
			content:info.join("<br>")                 
		});  
		(function(_info, _marker) {
			AMap.event.addListener(marker,"click",function(e){  
				_info.open(map, _marker.getPosition());                 
			});
		})(inforWindow, marker);
		
//		markers.push(marker);
	}

//	console.log(markers);
	map.setFitView(); // 调整到合理视野
}

function test() {
	//构建点对象                 
	var marker = new AMap.Marker({                 
	  map:mapObj, //将点添加到地图                 
	  position:new AMap.LngLat(116.373881,39.907409),                    
	  icon:" http://webapi.amap.com/images/0.png  ",//marker图标，直接传递地址url                 
	  offset:new AMap.Pixel(-10,-35) //相对于基点的位置                 
	});                 
	               
	var info = [];                 
	info.push("<b>  高德软件</b>");                 
	info.push("  电话 :  010-84107000   邮编 : 100102");                 
	info.push("  地址 : 北京市望京阜通东大街方恒国际中心A座16层");                 
	               
	var inforWindow = new AMap.InfoWindow({                 
	  offset:new AMap.Pixel(0,-23),                 
	  content:info.join("<br>")                 
	});                 
	AMap.event.addListener(marker,"click",function(e){                 
	  inforWindow.open(mapObj,marker.getPosition());                 
	}); 
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
function lineSearch() {
	var roadLineName = $("#option2").val();
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
//        	 console.log(JSON.stringify(result));
        	if(status === 'complete' && result.info === 'OK'){
        		for(var i = 0 ; i < result.lineInfo.length ; i++) {
        			lineSearch_Callback(result);
        			
        			//以下用来自己输出文件的、。。
        			roadList += result.lineInfo[i].id + ",";
        			roadList += "\"" + result.lineInfo[i].name + "\"" + ",";
        			roadList += "\"" + toLinestr(result.lineInfo[i].path)+ "\"" + "\n";
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

/*
 * 公交路线查询服务返回数据解析概况
 * param Array[]  lineArr     返回公交线路总数
 * param String   lineName    公交线路名称
 * param String   lineCity    公交所在城市
 * param String   company     公交所属公司
 * param Number   stime       首班车时间
 * param Number   etime       末班车时间
 * param Number   bprice      公交起步票价
 * param Number   tprice      公交全程票价
 * param Array[]  pathArr     公交线路路径数组
 */
function lineSearch_Callback(data) {
    var lineArr  = data.lineInfo;
    var lineNum  = data.lineInfo.length;
    if(lineNum == 0) {
    }
    else {
        for(var i = 0; i < lineNum; i++) {
            var lineName = lineArr[i].name;
            var lineCity = lineArr[i].city;
            var distance = lineArr[i].distance;
            var company  = lineArr[i].company;
            var stime    = lineArr[i].stime;
            var etime    = lineArr[i].etime;
            var pathArr  = lineArr[i].path;
            var stops    = lineArr[i].via_stops;
            var startPot = stops[0].location;
            var endPot   = stops[stops.length-1].location;
            //绘制第一条路线
            if(i==0) drawbusLine(startPot,endPot,pathArr);
        }
    }
}

/*
 *绘制路线
 */
function drawbusLine(startPot,endPot,BusArr) {
    //自定义起点，终点图标
     var sicon = new AMap.Icon({
        image: "http://api.amap.com/Public/images/js/poi.png",
        size: new AMap.Size(44,44),
        imageOffset: new AMap.Pixel(-334, -180)
    });
     var eicon = new AMap.Icon({
        image: "http://api.amap.com/Public/images/js/poi.png",
        size: new AMap.Size(44,44),
        imageOffset: new AMap.Pixel(-334, -134)
    });
    //绘制起点，终点
    var stmarker = new AMap.Marker({
        map:map,
        position:new AMap.LngLat(startPot.lng,startPot.lat), //基点位置
        icon:sicon, //复杂图标
        offset:{x:-16,y:-34}, //相对于基点的位置
        zIndex:10
    });
    var endmarker = new AMap.Marker({
        map:map,
        position:new AMap.LngLat(endPot.lng,endPot.lat), //基点位置
        icon:eicon, //复杂图标
        offset:{x:-16,y:-34}, //相对于基点的位置
        zIndex:10
    });
    //绘制乘车的路线
        busPolyline = new AMap.Polyline({
            map:map,
            path:BusArr,
            strokeColor:"#005cb5",//线颜色
            strokeOpacity:0.8,//线透明度
            strokeWeight:6//线宽
        });
        map.setFitView();
}

var testList = "123路拥军线:悦民路,麒麟门新大街,锦绣花园,麒麟山庄,西村,东郊小镇,晨光,金丝岗,孟庄,锁石村,孟北,坟头,候家塘,黄栗墅,张肖庄西站,张肖庄,汤山溶洞,汤山西站,汤山中学,汤山站,汤山东站,陈达村,汤山汽运六队,作厂,南京炮院站,经三路,西营房,新北路,东营房";

var stationsMap = new HashMap();

/**
 * 公交线路，数组对象，其中lines[0]为线路名称，如 "123路拥军线":["悦民路", "麒麟门新大街", ...]
 * 
 * @param nameList
 */
function batchStationSearch() {
	var nameList = $("#option1").val().split(",");
	//查询内存中是否存在该公交站点名称，若没有则向高德API发起请求
	for(var i = 0 ; i < nameList.length ; i++) {
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
	for(var i = 0 ; i < nameList.length ; i++) {
		if(stationsMap.containsKey(nameList[i])) {
			var st = stationsMap.get(nameList[i]);
			//在地图上画出该站点的所有位置
			addMarker(getPoints(st));
		} else {
			stationSearch(nameList[i]);
		}
	}
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
//        	console.log(JSON.stringify(result));
        	if(status === 'complete' && result.info === 'OK'){
        		stationSearchCallBak(stationName, result);
        	}
        }); 
    });
}

/**
 * 返回高德API stationInfo对象中buslines的所有不同点
 * 
 * @param st
 * @returns {Array}
 * 				{
 * 					stationName : "",	//站台名称 
 * 					lnglat : [double, double],
 * 					lines : ["", ...]	//该点经过的路线
 * 				}
 */
function getPoints(st) {
	var points = [];
	for(var m = 0 ; m < st.stationInfo.length ; m++) {
		var buslines = st.stationInfo[m].buslines;
		
		for(var i = 0 ; i < buslines.length ; i++) {
			var tmpPoint = [buslines[i].location.lng, buslines[i].location.lat];
			var hasP = false;
			var j;
			for(j = 0 ; j < points.length ; j++) {
				if(points[j].lnglat[0] == tmpPoint[0] && points[j].lnglat[1] == tmpPoint[1]) {
					hasP = true;
					console.log("true");
					console.log(tmpPoint);
					break;
				}
			}
			if(!hasP) {
				var tp = {};
				tp.stationName = st.stationInfo[0].name;
				tp.lnglat = tmpPoint;
				tp.lines = [];
				//这里过滤高德的括号内容 ：  55路(悦民路--长白街) -> 55路
				tp.lines.push(buslines[i].name.split("(")[0]);
				
				points.push(tp);
			} else {
				points[j].lines.push(buslines[i].name.split("(")[0]);
			}
			
		}
	}

	return points;
}
