/*
 * 该示例主要流程分为三个步骤
 * 1. 首先调用公交路线查询服务(lineSearch)
 * 2. 根据返回结果解析，输出解析结果(lineSearch_Callback)
 * 3. 在地图上绘制公交线路()
 */
var resLine  = ''; //结果表格对象

var cityName = "南京市";

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
			map: map, //将点添加到地图
			icon: "http://webapi.amap.com/images/marker_sprite.png",
			position: obj[i].lnglat, //相对于基点的位置
			draggable: true //添加点标记可拖拽
		});
		
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
		
	}

	map.setFitView(); // 调整到合理视野
}

/**
 * 通过读取textarea里公交线路名称搜索
 * 
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

/**
 * 绘制路线
 * 
 * @param startPot
 * @param endPot
 * @param BusArr
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
        	if(status === 'complete' && result.info === 'OK'){
        		stationSearchCallBak(stationName, result);
        	}
        }); 
    });
}

/*
 *公交线路查询
 *
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

function transferSearch() {
	//根据起终点名称查询公交换乘
	var words = $("#option3").val().split(",");
//    var keywords = [{keyword : '南堡公园'},{keyword : '金陵六村'}];
    var keywords = [{keyword : words[0]},{keyword : words[1]}];
    AMap.service('AMap.Transfer',function(){
        transfer = new AMap.Transfer();
        transfer.setCity('南京市');
        transfer.search(keywords, function(status, data){
        if(status === 'complete'){
        	console.log(JSON.stringify(data));
        	//返回对象格式 ： http://lbs.amap.com/api/javascript-api/reference/search_plugin/#m_TransferResult
        	//对返回对象的BUS路线进行提取
        	var plan = data.plans[0];
        	for(var i = 0 ; i < plan.segments.length ; i++) {
        		if("BUS" == plan.segments[i].transit_mode) {
        			var path = plan.segments[i].transit.path;
        			drawbusLine(path[0], path[path.length - 1], path);
        			
        		}
        	}
        }
      });
    });
}

//------------------------------关键字查询 start----------------------------------------------//
function placeSearch(){
	var val = $("#option4").val();
    var MSearch;
    AMap.service(["AMap.PlaceSearch"], function() {       
        MSearch = new AMap.PlaceSearch({ //构造地点查询类
            pageSize:10,
            pageIndex:1,
            city:"南京市" //城市
        });
        //关键字查询
        MSearch.search(val, function(status, result){
        	if(status === 'complete' && result.info === 'OK'){
        		keywordSearch_CallBack(result);
        	}
        }); 
    });
}

var windowsArr = new Array();
var marker = new Array();

//添加marker&infowindow   
function addmarker(i, d) {
    var lngX = d.location.getLng();
    var latY = d.location.getLat();
    var markerOption = {
        map:map,
        icon:"http://webapi.amap.com/images/" + (i + 1) + ".png",
        position:new AMap.LngLat(lngX, latY),
        topWhenMouseOver:true

    };
    var mar = new AMap.Marker(markerOption);         
    marker.push(new AMap.LngLat(lngX, latY));
 
    var infoWindow = new AMap.InfoWindow({
        content:"<h3><font color=\"#00a6ac\">  " + (i + 1) + ". " + d.name + "</font></h3>" + TipContents(d.type, d.address, d.tel),
        size:new AMap.Size(300, 0),
        autoMove:true, 
        offset:new AMap.Pixel(0,-20)
    });
    windowsArr.push(infoWindow);
    var aa = function (e) {infoWindow.open(map, mar.getPosition());};
    AMap.event.addListener(mar, "mouseover", aa);
}

//回调函数
function keywordSearch_CallBack(data) {
    var resultStr = "";
    var poiArr = data.poiList.pois;
    var resultCount = poiArr.length;
    for (var i = 0; i < resultCount; i++) {
        resultStr += "<div id='divid" + (i + 1) + "' onmouseover='openMarkerTipById1(" + i + ",this)' onmouseout='onmouseout_MarkerStyle(" + (i + 1) + ",this)' style=\"font-size: 12px;cursor:pointer;padding:0px 0 4px 2px; border-bottom:1px solid #C1FFC1;\"><table><tr><td><img src=\"http://webapi.amap.com/images/" + (i + 1) + ".png\"></td>" + "<td><h3><font color=\"#00a6ac\">名称: " + poiArr[i].name + "</font></h3>";
            resultStr += TipContents(poiArr[i].type, poiArr[i].address, poiArr[i].tel) + "</td></tr></table></div>";
            addmarker(i, poiArr[i]);
    }
    map.setFitView();
}

function TipContents(type, address, tel) {  //窗体内容
    if (type == "" || type == "undefined" || type == null || type == " undefined" || typeof type == "undefined") {
        type = "暂无";
    }
    if (address == "" || address == "undefined" || address == null || address == " undefined" || typeof address == "undefined") {
        address = "暂无";
    }
    if (tel == "" || tel == "undefined" || tel == null || tel == " undefined" || typeof address == "tel") {
        tel = "暂无";
    }
    var str = "  地址：" + address + "<br />  电话：" + tel + " <br />  类型：" + type;
    return str;
}

function openMarkerTipById1(pointid, thiss) {  //根据id 打开搜索结果点tip
    thiss.style.background = '#CAE1FF';
    windowsArr[pointid].open(map, marker[pointid]);
}

function onmouseout_MarkerStyle(pointid, thiss) { //鼠标移开后点样式恢复
    thiss.style.background = "";
}

//------------------------------关键字查询 end------------------------------------------------//


//-------------------------------道路查询 start----------------------------------------------//

function roadSearch() {
	var roadLineName = $("#option2").val();
    var MSearch;
    AMap.service(["AMap.RoadInfoSearch"], function() {        
        MSearch = new AMap.RoadInfoSearch({ //构造地点查询类
            pageSize:10,
            pageIndex:1,
            city:cityName //城市
        });
        //关键字查询
        MSearch.roadInfoSearchByRoadName(roadLineName, function(status, result){
        	if(status === 'complete' && result.info === 'OK'){
        		roadSearch_CallBack(result);
        	}
        }); 
    });
}
//回调函数
function roadSearch_CallBack(data) {
    var resultStr = "";
    var roadArr = data.roadInfo;
    var resultCount = roadArr.length;
	var pathArr = [];
	var pathArr1 = [];
    for (var i = 0; i < resultCount; i++) {
         pathArr = roadArr[i].path;

        for(var j = 0; j < pathArr.length; j++){
            var e = pathArr[j];
            pathArr1 = [];
            for(l = 0;l < e.length; l++){
                var path = e[l];
                pathArr1.push(path);
            }
            var polyline = new AMap.Polyline({
                map: map,
                path: pathArr1,
                strokeColor: "#CC0000"//线颜色
            });
        }
    }

    map.setFitView();
}

//-------------------------------道路查询 end------------------------------------------------//

//为地图注册click事件获取鼠标点击出的经纬度坐标
function catchLngLat() {
	$("#tip").show();
	var clickEventListener = map.on( 'click', function(e) {
	    var lng = e.lnglat.getLng();
	    var lat = e.lnglat.getLat();
	    console.log("lng,lat:" + lng + "," + lat);
	    $("#lnglat").text("lng,lat:" + lng + "," + lat);
	});
}