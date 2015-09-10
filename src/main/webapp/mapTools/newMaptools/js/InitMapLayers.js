    var isUpdation = 0;
	var map;
    var baseLayer = null;
    var gpsProjection = new OpenLayers.Projection("EPSG:4326");
    var hoverLayer = null;
    var wktReader = new jsts.io.WKTReader();  
    var wktWriter = new jsts.io.WKTWriter();
    var parser = new jsts.io.OpenLayersParser(); 
    var boundary = null;
    var isOrdered = false;
    var dupliCount = 0;
    
    var FileType = {
        "JSON":"JSON",
        "CSV":"CSV",
        "Unknown":""
    };
    
    var levelMapping = {
			"motorway": 1,
			"trunk": 2,
			"primary": 2,
			"secondary": 3,
			"tertiary": 3,
			"unclassified": 3
	}

    var roadsInfo = [];
    var waysInfo = [];
    var modifiedRoads = {}; 
    var mergedWaysInfos = {};
    var undrawedWays = {};
    var selectedRoadName = "";
    var undrawedFeatures = [];
    var roadIndex = 1;
    var roadsInJSON = [];
    var clickedLi = null;
    var selectedRoadLayer = null;
    var roadsID = {};
    
    function init() {
    	
    	 var url = window.location.href;
         if (url.indexOf("?") != -1)
         {
        	 isUpdation = parseInt(url.substr(url.indexOf("=") + 1));
         }
    	
    	var tilesLayer;
        map = new OpenLayers.Map( 'map', {
            controls : [ new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.Permalink(),
                new OpenLayers.Control.ScaleLine({ geodesic : true }),
                new OpenLayers.Control.Permalink('permalink'),
                new OpenLayers.Control.MousePosition(),
                new OpenLayers.Control.Attribution() ],
            numZoomLevels : 19,
            units : 'm',
            projection : new OpenLayers.Projection("EPSG:4326"),
            displayProjection : new OpenLayers.Projection("EPSG:4326")
        });
        tilesLayer =new OpenLayers.Layer.OSM("Tiles",
            //"http://a.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/78603/256/${z}/${x}/${y}.png",  
            "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
            
            {
                numZoomLevels : 19,
                "tileOptions" : {"crossOriginKeyword" : null}
            }
        );
        map.addLayer(tilesLayer);
        
        baseLayer = new OpenLayers.Layer.Vector( "baseLayer");
        map.addLayer(baseLayer);
        baseLayer.setOpacity(0.7);
        
        selectedRoadLayer = new OpenLayers.Layer.Vector("selectedRoadLayer");
        map.addLayer(selectedRoadLayer);
        
        map.setLayerIndex(selectedRoadLayer, 2);
        map.setLayerIndex(baseLayer, 1);
        
        setMapCenter(118.77,32.04); // nanjing
        //setMapCenter(102.6833,25.0667); // kunming
        initHoverLayer();
        addDoubleClickHandler();
        initDragDrop();
        
        //init draw controls
        boxLayer = new OpenLayers.Layer.Vector("box Layer");
        map.addLayer(boxLayer);
		initDrawControls();
		
		initAccordion();
    }
    
   

    function setMapCenter(lon,lat){
        map.setCenter(
            new OpenLayers.LonLat(lon,lat).transform(
                gpsProjection,
                map.getProjectionObject()
            ), 12
        );
    }
    

