  function initAccordion()
    {
       	$( "#accordion" ).accordion({
       		disabled:  true
  	    });
       	
    }
    
    
    function initDrawControls()
    {
        var boxControl = new OpenLayers.Control.DrawFeature(boxLayer, OpenLayers.Handler.RegularPolygon, {
            handlerOptions: {
                sides: 4,
                irregular: true
            } 
		});

		var selectControl =  new OpenLayers.Control.SelectFeature([baseLayer, boxLayer, selectedRoadLayer],
		{
			 selectStyle : {
			     fillColor : "red",
			     stroke : true,
			     strokeColor : "red",
			     strokeWidth : 4,
			     fillOpacity : 0.5,
			     pointRadius : 6
			 },
			 onSelect: onFeatureSelect
		});
		
		highlightControl = new OpenLayers.Control.SelectFeature([baseLayer, boxLayer, selectedRoadLayer], {
				hover: true,
				highlightOnly: true,
				selectStyle : {
						fillColor : "red",
						stroke : true,
						strokeColor : "red",
						strokeWidth : 4,
						fillOpacity : 0.5,
						pointRadius : 6
				},
				renderIntent: "temporary"

		});
		
		map.addControl(highlightControl);
		
		drawControls = {
			box : boxControl,
			select : selectControl
		};
		
		boxControl.events.register('featureadded', boxLayer, modifyWays);
		
		for(var key in drawControls) {
			map.addControl(drawControls[key]);
		}
    }
    
    function onFeatureSelect(feature) 
    {
    	console.log(feature);
    	if(selectedRoadLayer.getFeatureById(feature.id))
    	{
    		$.each(undrawedFeatures, function(i, ufeature){
    			if(ufeature.properties.way_id == feature.properties.way_id)
    			{
    				undrawedFeatures.splice(i, 1);
    			}
    		});
    		
    		$.each(mergedWaysInfos[selectedRoadName], function(i, way){
    			$.each(way.features, function(j, f){
    				if(f.properties.way_id == feature.properties.way_id)
    				{
    					way.features.splice(j, 1);
    					if(way.features.length == 0)
    					{
    						mergedWaysInfos[selectedRoadName].splice(i, 1);
    					}
    				}
    			});
    		});
    		selectedRoadLayer.removeFeatures([feature]);
    	}
    	
    }

    function toggleControl(element) 
    {
     	if(element.value == "select")
    	{
    		hoverLayer.deactivate();
    		dblclick.deactivate();
    		highlightControl.activate();
    	} else {
    		highlightControl.deactivate();
    		hoverLayer.activate();
    		dblclick.activate();
    	} 
    	
        for(key in drawControls) {
            var control = drawControls[key];
            if(element.value == key && element.checked) {
                control.activate();
            } else {
                control.deactivate();
            }
        }
    }
    

    function addDoubleClickHandler() {
    	
        var DblclickFeature = OpenLayers.Class(OpenLayers.Control, {
            initialize: function (baseLayer, options) {
                OpenLayers.Control.prototype.initialize.apply(this, [options]);
                this.handler = new OpenLayers.Handler.Feature(this, baseLayer, {
                    dblclick: this.dblclick
                });
            }
        });
        dblclick = new DblclickFeature(baseLayer, {
            dblclick: function (event) {
            	console.log(event);
            	$.each(waysInfo.features, function(i, feature){
             		var geo = feature.geometry;
           			var isDrawed = false;
           			if(feature.properties.way_id == event.properties.way_id)
           			{
	           			$.each(waysInRoad.features, function(i, way){
	           				if(way.properties.way_id == feature.properties.way_id)
	           				{
	           					isDrawed = true;
	           				}
	           			});
	           			
	           			if(!isDrawed)
	           			{
	           				undrawedFeatures.push(feature);
	           				undrawedWays.features = undrawedFeatures;
	                        undrawedWays.color = "#7FFF00";
	                        drawObj(undrawedWays, selectedRoadLayer, false);  
	           			}
           			}
             	}); 
            }
        });

        map.addControl(dblclick);
        dblclick.activate();
    }

    function initHoverLayer(){
        hoverLayer = new OpenLayers.Control.SelectFeature([baseLayer, selectedRoadLayer], {
            hover : true,
            highlightOnly: true,
            selectStyle : {
                fillColor : "red",
                stroke : true,
                strokeColor : "red",
                strokeWidth : 5,
                fillOpacity : 0.5,
                pointRadius : 6
            }, 
            renderIntent: "temporary"
        });
        map.addControl(hoverLayer);
        hoverLayer.activate();
    }
    
    function modifyWays(e)
    {
    	var features = [];
    	if(this.features.length > 1)
    	{
    		boxLayer.removeFeatures(this.features[0]);
    	}
    	drawControls["box"].deactivate();
    	
    	$("#noneToggle").prop("checked",true);
    	$("#boxToggle").prop("checked", false);
    	var bounds = this.features[0].geometry.getBounds().transform(map.getProjectionObject(), gpsProjection);
     	 
    	drawLinesInBounds(bounds);
    }
    
    function drawLinesInBounds(bounds)
    {
    	var bounds = bounds;
    	var waysInBounds = {};
    	var featuresInBounds = [];
    	
    	$.each(waysInfo.features, function(i, feature){
     		var geo = feature.geometry;
     		var length = geo.coordinates.length;

     		if(isPointInBox(geo.coordinates[0], bounds) && isPointInBox(geo.coordinates[length - 1], bounds))
     		{
    			var isDrawed = false;
    			$.each(waysInRoad.features, function(i, way){
    				if(way.properties.way_id == feature.properties.way_id)
    				{
    					isDrawed = true;
    				}
    			});
    			
    			if(!isDrawed)
    			{
    				featuresInBounds.push(feature);
    			}
     		}
     	}); 
     	
    	waysInBounds.features = featuresInBounds;
    	waysInBounds.color = "#FFFF00";
        drawObj(waysInBounds, baseLayer, false);  
        
    }
    
    function isPointInBox(point, bounds)
    {
    	if(point[0] >= bounds.left && point[1] >= bounds.bottom && point[0] <= bounds.right && point[1] <= bounds.top )
    	{
    		return true;
    	} else {
    		return false;
    	}
    }
    