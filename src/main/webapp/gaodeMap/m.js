
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

function batchStationSearch() {
	var stationName;
	//查询内存中是否存在该公交站点名称，若没有则向高德API发起请求
	
	//获取站点详细信息
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
        	console.log(JSON.stringify(result));
        	if(status === 'complete' && result.info === 'OK'){
//        		stations.map = 
        	}
        }); 
    });
}

var stations = new Stations();

function Stations() {
	/**
	 * 存放从高德地图API里stationSearch的结果
	 * 
	 */
	this.map = new HashMap();
	
	this.add = function(stationName) {
		if(map.containsKey(stationName)) {
			return true;
		} else {
			
		}
	} 
}

function Lines() {
	/**
	 * 存放从高德地图API里lineSearch的结果
	 * 
	 */
	this.map = new HashMap();
}

function Station(ob) {
	//station对象，对应高德地图类型 StationSearchResult http://lbs.amap.com/api/javascript-api/reference/search_plugin/#m_StationSearchResult
	var st = ob;
	
	var id = map.size();
	
	/**
	 * 根据
	 */
	this.search = function(lineList) {
		
	}

}

function Line() {
	
}