function tile2Bound(xtile,ytile,zoom){
	var bound = {"left":0,"right":0,"top":0,"bottom":0};
	var leftTop = tile2Coordinate(xtile,ytile,zoom);
	var rightBottom = tile2Coordinate(parseInt(xtile) + 1,parseInt(ytile) + 1,zoom);

	bound.left = leftTop.lon;
	bound.right = rightBottom.lon;
	bound.top = leftTop.lat;
	bound.bottom = rightBottom.lat;
	return bound;
}

function tile2Coordinate(xtile,ytile,zoom){
	var coordinate = {
		"lon":0,
		"lat":0
	};
	coordinate.lon = xtile2Lon(xtile,zoom);
	coordinate.lat = ytile2Lat(ytile,zoom);
	return coordinate;
}

function ytile2Lat(ytile,zoom){
	var n=Math.PI-2*Math.PI*ytile/Math.pow(2,zoom);
 	return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

function xtile2Lon(xtile,zoom){
	return (xtile/Math.pow(2,zoom)*360-180);
}

function coordinate2Tile(lon,lat,zoom){
	var tile = {
		"xtile":0,
		"ytile":0
	};
	tile.xtile = long2xtile(lon,zoom);
	tile.ytile = long2ytile(lat,zoom);
	return tile;
}

function long2xtile(lon,zoom){
	return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}

function lat2ytile(lat,zoom){
	return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); 
}

var Wgs = new OpenLayers.Projection("EPSG:4326"); // Transform from WGS 1984
var Mercator = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection 

function mercator2WGS(coordinate){
	var tmp = new OpenLayers.Geometry.Point(coordinate.lon, coordinate.lat);
	var p = tmp.transform(Mercator,Wgs);
	return p;
}

function WGS2Mercator(coordinate){
	var tmp = new OpenLayers.Geometry.Point(coordinate.lon, coordinate.lat);
	var p = tmp.transform(Wgs,Mercator);
	return p;
}

function sinh(x) {
	return (Math.exp(x) - Math.exp(-x)) / 2.0;
}
