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
 
 /**
  * 计算两个字符串相似度的算法
  * http://blog.csdn.net/fover717/article/details/8142616
  * 
  * @param str1
  * @param str2
  */
function similarity(str1, str2) {
	
}