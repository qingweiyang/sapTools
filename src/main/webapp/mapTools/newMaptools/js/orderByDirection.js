/**
 * Order the merged roads by direction
 */

function orderByDirection(mergedRoad)
{
	var roadWithDirection = mergedRoad;
	$.each(roadWithDirection, function(i, way){

		way.direction = getWayInRoadDirection(way);
	});
	
	return roadWithDirection;
}

function getWayInRoadDirection(way)
{
	var direction;
	var length = way.features.length;
	var lastIndex = way.features[length - 1].geometry.coordinates.length;
	var heading = getHeadingInDegree(way.features[0].geometry.coordinates[0], way.features[length - 1].geometry.coordinates[lastIndex - 1]);
	var orientation = headingToOrientation(heading);
	
	switch (orientation)
	{
		case 1:  
			direction = 0;
			break;
		case 4: 
			direction = 0;
			break;
		case 2:
			direction = 1;
			break;
		case 3:
			direction = 1;
			break;
		default:
			direction = 3;
			break;
	}
	
	return direction;
}

function getWayDirection(way)
{
	var direction;
	var length = way.geometry.coordinates.length;
	var heading = getHeadingInDegree(way.geometry.coordinates[0], way.geometry.coordinates[length - 1]);
	var orientation = headingToOrientation(heading);
	
	switch (orientation)
	{
		case 1:  
			direction = 0;
			break;
		case 4: 
			direction = 0;
			break;
		case 2:
			direction = 1;
			break;
		case 3:
			direction = 1;
			break;
		default:
			direction = 3;
			break;
	}
	
	return direction;
}

function getHeadingInDegree(from, to)
{
	var heading;
	var x1 = to[0] - from[0];
	var y1 = to[1] - from[1];
	var x2 = 0;
	var y2 = 1;
	var cosValue = (x1*x2 + y1*y2) / ((Math.sqrt(x1*x1 + y1*y1)) * (Math.sqrt(x2*x2 + y2*y2)));
	var deltaRadian = Math.acos(cosValue);
	
	if(x1 > 0)
	{
		heading = deltaRadian * 180 / Math.PI;
	} else {
		heading = 360 - deltaRadian * 180 / Math.PI;
	}
	
	return heading;
}

function headingToOrientation(heading)
{
	var orientation;
	var N_DIR = 8;
	
	var INVALID_ORIENTATION = 0;
	
		var SOUTH_TO_NORTH = 1;
	    var WEST_TO_EAST = 2;
	    var NORTH_TO_SOUTH = 3;
	    var EAST_TO_WEST = 4;
	    
	    switch (parseInt((heading % 360) / (360 / (4 * 2))))
	    {
		case 7:
		case 0:
			orientation = SOUTH_TO_NORTH;
			break;
		case 1:
		case 2: 
			orientation = WEST_TO_EAST;
	        break;
		case 3:
	    case 4:
	        orientation = NORTH_TO_SOUTH;
	        break;
	    case 5:
	    case 6:
	        orientation = EAST_TO_WEST;
	        break;
	    default:
	        orientation = 0;
	        break;

	};
	
/*    var SOUTH_TO_NORTH = 1;
    var SOUTHWEST_TO_NORTHEAST = 2;
    var WEST_TO_EAST = 3;
    var NORTHWEST_TO_SOUTHEAST = 4;
    var NORTH_TO_SOUTH = 5;
    var NORTHEAST_TO_SOUTHWEST = 6;
    var EAST_TO_WEST = 7;
    var SOUTHEAST_TO_NORTHWEST = 8;*/
    
   /* var CLOCKWISE_LOOP = 9;
    var COUNTER_CLOCKWISE_LOOP;

	switch (parseInt((heading % 360) / (360 / (N_DIR * 2))))
	{
		case 15:
		case 0:
			orientation = SOUTH_TO_NORTH;
			break;
		case 1:
		case 2: 
			orientation = SOUTHWEST_TO_NORTHEAST;
	        break;
		case 3:
	    case 4:
	        orientation = WEST_TO_EAST;
	        break;
	    case 5:
	    case 6:
	        orientation = NORTHWEST_TO_SOUTHEAST;
	        break;
	    case 7:
	    case 8:
	        orientation = NORTH_TO_SOUTH;
	        break;
	    case 9:
	    case 10:
	        orientation = NORTHEAST_TO_SOUTHWEST;
	        break;
	    case 11:
	    case 12:
	        orientation = EAST_TO_WEST;
	        break;
	    case 13:
	    case 14:
	    default:
	        orientation = SOUTHEAST_TO_NORTHWEST;
	        break;

	};*/
	return orientation;
}