
/**
 * validate the roads before export
 */

function validateRoads(roads, waysInfo)
{
	console.log(roads);
	var lines = [];
	var waysArr = [];
	var roadsObj = {};
	
	lines = roads.split("\n");
	
	$.each(lines, function(i, line){
		var wayArr = line.split(",");
		waysArr.push(wayArr);
		
	});
	
	checkWayIDs(waysArr, waysInfo.features)
}

function checkWayIDs(waysArr, features)
{
	var invaldWayIDs = [];
	$.each(waysArr, function(i, way){
		var isExisted = false;
		
		$.each(features, function(j, feature){
			if(feature.properties.way_id == way[3])
			{
				isExisted = true;
			}
		});
		
		if(!isExisted)
		{
			invaldWayIDs.push(way[3]);
		}
	})
	
	console.log(invaldWayIDs.length);
	if(invaldWayIDs.length > 1)
	{
		alert("Invalid Way IDs: " + invaldWayIDs.toString());
	}
}