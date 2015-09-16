/**
 * 去换行
 */
function dismissNewline(str) {
	return str.replace(/(\n)+|(\r\n)+/g, "");
}

/**
 * 输出content到fileName文件中
 * 
 * @param fileName
 * @param content
 */
function downloadFile(fileName, content){
    var aLink = document.createElement('a');
    var blob = new Blob([content]);
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, false);
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
}

/**
 * hashmap结构的js实现
 * 
 */
 function HashMap()
 {
     /** Map 大小 **/
     var size = 0;
     /** 对象 **/
     var entry = new Object();
     
     /** 存 **/
     this.put = function (key , value)
     {
         if(!this.containsKey(key))
         {
             size ++ ;
         }
         entry[key] = value;
     }
     
     /** 取 **/
     this.get = function (key)
     {
         return this.containsKey(key) ? entry[key] : null;
     }
     
     /** 删除 **/
     this.remove = function ( key )
     {
         if( this.containsKey(key) && ( delete entry[key] ) )
         {
             size --;
         }
     }
     
     /** 是否包含 Key **/
     this.containsKey = function ( key )
     {
         return (key in entry);
     }
     
     /** 是否包含 Value **/
     this.containsValue = function ( value )
     {
         for(var prop in entry)
         {
             if(entry[prop] == value)
             {
                 return true;
             }
         }
         return false;
     }
     
     /** 所有 Value **/
     this.values = function ()
     {
         var values = new Array();
         for(var prop in entry)
         {
             values.push(entry[prop]);
         }
         return values;
     }
     
     /** 所有 Key **/
     this.keys = function ()
     {
         var keys = new Array();
         for(var prop in entry)
         {
             keys.push(prop);
         }
         return keys;
     }
     
     /** Map Size **/
     this.size = function ()
     {
         return size;
     }
     
     /* 清空 */
     this.clear = function ()
     {
         size = 0;
         entry = new Object();
     }
 }

/**
 * 计算方位角pab
 * http://lszdb1983.blog.163.com/blog/static/20426348201273084842686/
 * eg: gps2d(32.058758, 118.985313, 32.058778, 118.985556)
 * 
 * @param lat_a
 * @param lng_a
 * @param lat_b
 * @param lng_b
 * @returns
 */ 
function gps2d(lat_a, lng_a, lat_b, lng_b) {
	lat_a = lat_a * 100000;
	lng_a = lng_a * 100000;
	lat_b = lat_b * 100000;
	lng_b = lng_b * 100000;
	
	var d = 0;
	lat_a=lat_a*Math.PI/180;
	lng_a=lng_a*Math.PI/180;
	lat_b=lat_b*Math.PI/180;
	lng_b=lng_b*Math.PI/180;
	         
	d=Math.sin(lat_a)*Math.sin(lat_b)+Math.cos(lat_a)*Math.cos(lat_b)*Math.cos(lng_b-lng_a);
	d=Math.sqrt(1-d*d);
	d=Math.cos(lat_b)*Math.sin(lng_b-lng_a)/d;
	d=Math.asin(d)*180/Math.PI;
	  
	return d;
}

var a = 6378245.0;// WGS 长轴半径
var ee = 0.00669342162296594323;// WGS 偏心率的平方
// gcj02-84
function gcj2wgs(lon, lat) {
	var localHashMap = new HashMap();
	var lontitude = lon - (transform(lon, lat).get("lon") - lon);
	var latitude = lat - (transform(lon, lat).get("lat") - lat);
	localHashMap.put("lon", lontitude);
	localHashMap.put("lat", latitude);
	var point = [];
	point[0] = lontitude;
	point[1] = latitude;
//	console.log(point);
	return point;
}
function transform(lon, lat) {
	var localHashMap = new HashMap();
	if (outofChina(lat, lon)) {
		localHashMap.put("lon", lon);
		localHashMap.put("lat", lat);
		return localHashMap;
	}
	var dLat = transformLat(lon - 105.0, lat - 35.0);
	var dLon = transformLon(lon - 105.0, lat - 35.0);
	var radLat = lat / 180.0 * Math.PI;
	var magic = Math.sin(radLat);
	magic = 1 - ee * magic * magic;
	var sqrtMagic = Math.sqrt(magic);
	dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
	dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
	var mgLat = lat + dLat;
	var mgLon = lon + dLon;
	localHashMap.put("lon", mgLon);
	localHashMap.put("lat", mgLat);
	return localHashMap;
}
function transformLat(x, y) {
	var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
			+ 0.2 * Math.sqrt(Math.abs(x));
	ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
	ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
	ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
	return ret;
}
// 84->gcj02
function transformLon(x, y) {
	var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
			* Math.sqrt(Math.abs(x));
	ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
	ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
	ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0
			* Math.PI)) * 2.0 / 3.0;
	return ret;
}
/**
 * 中国坐标内
 * 
 * @param lat
 * @param lon
 * @return
 */
function outofChina(lat, lon) {
	if (lon < 72.004 || lon > 137.8347)
		return true;
	if (lat < 0.8293 || lat > 55.8271)
		return true;
	return false;
}


 /**
  * 计算两个字符串相似度的算法
  * http://blog.csdn.net/fover717/article/details/8142616
  * 
  * @param str1
  * @param str2
  */
function similarity(str1, str2) {
	
}