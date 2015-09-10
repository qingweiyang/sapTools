 /**
 * Functions of drawing features on map
 */
    function drawObj(obj, dlayer, changeZoomLevel){
        var ret = true;
        var data = obj;

        if(ret){
            var layerToDraw = dlayer;
            var color = data.color;

            drawGeoJson(layerToDraw,data,color);
            if(changeZoomLevel)
            {
            	map.zoomToExtent(layerToDraw.getDataExtent());
            }
        } 
        return ret;
    }

    function drawGeoJson(layerToDraw,geoJson,color){
    	$.each(geoJson.features, function(i, feature){
    		var properties = feature.properties;
            var geometry = feature.geometry;
            var coordinates = geometry.coordinates;
            drawLineString(layerToDraw, coordinates, properties, color);
    	});
    }
    
    function JSTSCoordinates2Array(coordinates) {
        var pointsArray = [];
        for(var i = 0; i < coordinates.length;i++){
            pointsArray.push([coordinates[i].x,coordinates[i].y]);
        }
        return pointsArray;
    }

    
    function drawLineString(layerToDraw,coordinates,properties,color){
        var points = getPointsArray(coordinates);
		var fromto = {};
		var length = coordinates.length;
		var sWidth = 4;
		
		if(layerToDraw.name == "selectedRoadLayer")
		{
			sWidth = 6;
			if(properties.direction == 0)
			{
				color = "#FFD700";
			}
			
		}
		fromto.from = coordinates[0];
		fromto.to = coordinates[length - 1];
        
		
        var style = {
                fillColor: color,
                stroke: true,
                strokeColor: color,
                strokeWidth: sWidth,
                fillOpacity: 0.9,
                pointRadius: 6
            };
        var line = new OpenLayers.Geometry.LineString(points);
        var lineFeature = new OpenLayers.Feature.Vector(line, null, style);
        lineFeature.properties = properties;
        lineFeature.fromto = fromto;
        layerToDraw.addFeatures([lineFeature]);
    }

    function drawPoint(layerToDraw,lon,lat, properties,color)
    {
        var p = new OpenLayers.Geometry.Point(lon, lat).transform(gpsProjection,  map.getProjectionObject());
        var style = {
                    fillColor: color,
                    stroke: false,
                    strokeColor: color,
                    strokeWidth: 5,
                    fillOpacity: 1,
                    pointRadius: 6
                };
        var feature = new OpenLayers.Feature.Vector(p, null, style);
        feature.properties = properties;
        layerToDraw.addFeatures([feature]);
    }   


    function getPointsArray(coordinates)
    {
        var points = [];
        for(var i = 0; i < coordinates.length; i++){
            var point = new OpenLayers.Geometry.Point(coordinates[i][0], coordinates[i][1]).transform(gpsProjection,  map.getProjectionObject());
            points.push(point);
        }
        return points;
    }
    
    function destroyFeatures()
    {
    	boxLayer.removeAllFeatures();
    	selectedRoadLayer.removeAllFeatures();
    }
    
    function clearAllFeatures(){
        destroyFeatures();
    }
   