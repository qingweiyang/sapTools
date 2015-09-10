function createRoadList()
{
    $("#roads_info ul li").remove();
	var ul = $("#roads_info ul");
	for(var i = 0; i < roadsInfo.length; i ++)
	{
		var li = $("<li>" + roadsInfo[i].name + "</li>");
		ul.append(li);
	}
	
	roadListonClick($("#roads_info ul li"));
}  


function checkDuplicatedRoadName()
{
	if(roadsInJSON.length > 0 && roadsInfo.length > 0)
    {
        var copiedRoadsInfo = roadsInfo;
		var duplicateIndexArray = [];
		var max = getMaxID();
		$.each(copiedRoadsInfo, function(i, road){
            var isDuplicated = false;
			if(mergedWaysInfos[road.name]){
    			var duplicateRoads = checkSameNameWays(mergedWaysInfos[road.name]);
    			if(duplicateRoads.length > 1 )
    			{
    				dupliCount ++;
                    isDuplicated = true;
    				duplicateIndexArray.push(i);
    				delete mergedWaysInfos[road.name];
    				$.each(duplicateRoads, function(j, droad){
    					var r = {};
    					r.id = max + j + 1;
    					max = r.id;
    					r.name = road.name + j;
    					r.nameEn = road.nameEn;
    					r.rate = road.rate;
    					roadsInfo.push(r);
    					mergedWaysInfos[r.name] = droad;
    					roadsID[r.name] = r.id;
    				});
    			} else {
    				mergedWaysInfos[road.name] = duplicateRoads[0];
    			}
    			
			}
            if(isDuplicated)
            {
               roadsInfo.splice(i, 1); 
            }
		});
        createRoadList();
    }
}

function mergedWaysInformation()
{
	if(roadsInJSON.length > 0 && waysInfo.features != undefined){
    	$.each(waysInfo.features, function(i, way){
    		way.properties.direction = getWayDirection(way);
    	});
    	mergedWaysInfos = preprocess(roadsInJSON,waysInfo);
    }
}

function autoCompletRoads()
{
	completeRoadsList = [];
	var deltaRoads = [];
	var originNameArray = [];
	
	$.each(roadsInJSON, function(i, road){
		originNameArray.push(road.name);
	});
	if(roadsInfo.length > 1)
	{
		var userNameArray = [];
		var deltaRoadsList = [];
		$.each(roadsInfo, function(i, road){
			userNameArray.push(road.name);
		});
		completeRoadsList = roadsInfo;
		deltaRoads = Array.minus(originNameArray, userNameArray);
		$.each(deltaRoads, function(i, road){
			$.each(roadsInJSON, function(j, oroad){
				if(road == oroad.name)
				{
					var id;
					var isExisted = false;
					if(roadsID[road])
					{
						isExisted = true;
						id = roadsID[road];
					}
					
					if(!isExisted)
					{
						var max = getMaxID();
						id = max + 1;
						roadsID[road] = id;
					}
					var r = {};
					r.id = id;
					r.rate = oroad.level;
					r.name = road;
					r.nameEn = "";
					completeRoadsList.push(r);
				}
			})
		});
		
	} else {
		deltaRoads = originNameArray;
		completeRoadsList = roadsInJSON;
	}
	
	for(var i = 0; i < deltaRoads.length; i ++)
	{
		var li = $("<li style='color:green;'>" + deltaRoads[i] + "</li>");
		$("#roads_info ul").append(li);
	}
	
	roadListonClick($("#roads_info ul li"));
}
    

    
   function roadListonClick(element)
   {
	   element.click(function(e){
	   		destroyFeatures();
	   		undrawedFeatures = [];
	        map.setLayerIndex(selectedRoadLayer, 2);
	        map.setLayerIndex(baseLayer, 1);
	      
	   		clickedLi = e.currentTarget;
	   		selectedRoadName = clickedLi.innerText.split(" ")[0];
	   		var selectedRoad = [];
	   		
	   		element.css("background", "");
	   		$(clickedLi).css("background-color", "yellow");
	   		$("#controls").show();
	    		
	   		waysInRoad = {};
	   		var features = [];
	   		waysInRoad.type = "FeatureCollection";
	   		
	   		$.each(mergedWaysInfos[selectedRoadName], function(i, section){
	   			$.each(section.features, function(j, way){
	   				features.push(way);
	   			});
	   		});
	   		
	       	waysInRoad.features = features;
	        waysInRoad.color = "#7FFF00";
	        drawObj(waysInRoad, selectedRoadLayer, true); 
   	});
   }
   
function confirmSelectedRoad()
{
    $(clickedLi).css("list-style-image", "url('images/selected.png')");
	if(selectedRoadName == "")
	{
		alert("Please select a road");
	} else {
		var mergedRoad = null;
		var roadInfo = "";
		
		if(undrawedFeatures.length < 1)
		{
			mergedRoad = mergedWaysInfos[selectedRoadName];
			roadWithDirection = orderByDirection(mergedRoad);
		} else {
			mergedRoad = mergeRoad(mergedWaysInfos,selectedRoadName, undrawedFeatures);
			
			if(mergedRoad.left.length > 0)
    		{
    			alert("There are some ways could not be merged into " + selectedRoadName  + "!");
    		}
			roadWithDirection = orderByDirection(mergedRoad.merged);
		}
		
		var id = getRoadId();
 		$.each(roadWithDirection, function(i, road){
 			
			$.each(road.features, function(j, way){
				var index = j+1;
				roadInfo += id + "," + selectedRoadName + "," + road.direction + "," + way.properties.way_id + "," + index + "\n";
			});
		});
		if(isUpdation == 0)
		{
			roadIndex++;
		}
		
		$("#exportResultArea").show();
		var str = $("#showModifiedRoads").val();
		$("#showModifiedRoads").val(str + roadInfo);
	}
}

function getRoadId(selectedRoadName)
{
	var id = roadIndex;
	if(isUpdation == 1)
	{
		var isExisted = false;
		
		if(roadsID[selectedRoadName])
		{
			isExisted = true;
			id = roadsID[selectedRoadName];
		}
		
		if(!isExisted)
		{
			var max = getMaxID();
			id = max + 1;
			roadsID[selectedRoadName] = id;
		}
	}
	
	return id;
}

function getMaxID()
{
	var max = 0;
	
	for(key in roadsID)
	{
		if(parseInt(roadsID[key]) > max)
		{
			max = parseInt(roadsID[key]);
		}
	}
	
	return max;
}

function triggerValidateRoads()
{
	validateRoads($("#showModifiedRoads").val(), waysInfo);
}

function exportRoadsList(aLink)
{
	var str = "";
	if(typeof(completeRoadsList) == "undefined")
	{
		completeRoadsList = roadsInfo;
	}
	
	if(isOrdered)
	{
		$.each(completeRoadsList, function(i, r){
			str += r.id + "," + r.rate +"," + r.name + "," + r.nameEn + "\n";
		});
	} else {
		$.each(completeRoadsList, function(i, r){
			str += r.id + "," + "" +"," + r.name + "," + r.nameEn + "\n";
		});
	}
	
	
	str = encodeURIComponent(str);
    aLink.href = "data:text/txt;charset=utf-8,\ufeff" + str;
}

function exportResultList(aLink)
{
	var str = $("#showModifiedRoads").val();
	str = encodeURIComponent(str);
    aLink.href = "data:text/txt;charset=utf-8,\ufeff" + str;
}
        
function orderByRoadLevel()
{
	isOrdered = true;
	var roadList = [];
 
    if(typeof(completeRoadsList) == "undefined")
	{
		completeRoadsList = roadsInfo;
	} 
	
	$(".roadLevelList").css("height", screen.height/6);
	$.each(completeRoadsList, function(i, road){
		if(mergedWaysInfos[road.name])
		{
			var length = mergedWaysInfos[road.name].length;
			var category = mergedWaysInfos[road.name][length - 1].features[0].properties.highway;
			var level = levelMapping[category];
			if(typeof(level) == "undefined")
			{
				for(var j=0; j < length; j++)
				{
					if(typeof(level) == "undefined")
					{
						category = mergedWaysInfos[road.name][j].features[0].properties.highway;
						level = levelMapping[category];
					}
				}
			}
			
			road.rate = level;
			road.category = category;
    		var $li = $("<li><span class='levelNameSpan'>"+ road.name + "</span><span class='levelCategorySpan'> (" + category +") </span></li>");
    		switch(level)
    		{
    		case 1: $("#level1 ul").append($li);
    				break;
    		case 2: $("#level2 ul").append($li);
					break;
    		case 3: $("#level3 ul").append($li);
					break;
			default: break;
    		}
		}
	});
	
	$("#accordionContainer").show();
	$(".roadLevelList").show();
	roadListonClick($(".roadLevelList ul li"));
	$(".roadLevelList ul").sortable({
	      connectWith: ".connectedSortable",
	      stop: afterRoadLevelSorting
	 });
}

function afterRoadLevelSorting(event, ui)
{
	console.log(ui);
	console.log($(this));
	console.log(event);
	if(event.toElement.className == "levelCategorySpan")
	{
		var innerT = event.toElement.innerText;
		var category = innerT.split("(")[1].split(")")[0];
		$.each(completeRoadsList, function(i, road){
			if(road.category == category)
			{
				var id = ui.item[0].parentElement.parentElement.id;
   				var rate = parseInt(id.substring(id.length - 1))
   				if(rate == 0)
   				{
   					rate = "";
   				} else if(rate == 4)
   				{
   					rate = 0;
   				}
   				road.rate = rate; 
			}
		});
		
		var lis = $(".connectedSortable li");
		$.each(lis, function(i, li){
			if(li.lastChild.innerText == innerT)
			{
				console.log(li);
				console.log($(li));
				$(".connectedSortable").remove($(li));
				$(ui.item[0].parentElement).append($(li));
			}
		});
			
	} else {
    	var roadName = ui.item[0].innerText.split(" ")[0];
   		$.each(completeRoadsList, function(i, road){
   			if(road.name == roadName)
   			{
   				var id = ui.item[0].parentElement.parentElement.id;
   				var rate = parseInt(id.substring(id.length - 1))
   				if(rate == 0)
   				{
   					rate = "";
   				} else if(rate == 4)
   				{
   					rate = 0;
   				}
   				road.rate = rate;
   			}
   		});
	}

}