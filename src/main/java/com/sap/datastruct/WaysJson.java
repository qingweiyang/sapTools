package com.sap.datastruct;

import java.util.ArrayList;
import java.util.List;
/**
 * 
 * @author I319213
 *
{
	"type":"FeatureCollection",
	"features":[
		{
			"type":"Feature",
			"geometry":{
				"type":"Point",
				"coordinates":[
				118.733865,
				32.0434843
				]
			},
			"properties":{
				"station_no":6009,
				"heading":184,
				"name":"江东北路水西门大街以北东侧",
				"stat":1,
				"lane_no":6,
				"t_stamp":"2015-07-27 14:13:55",
				"segment_id":2670694047418368,
				"district_id/name":"2139790/鼓楼区",
				"taz_id":0,
				"color":"blue"
			}
		}
	]
}
 */
public class WaysJson {
	private String type;
	
	private List<Features> features;

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public List<Features> getfeatures() {
		return features;
	}

	public void setfeatures(List<Features> features) {
		this.features = features;
	}

	public boolean addFeatures(Features f) {
		if(this.features == null) {
			features = new ArrayList<Features>();
			features.add(f);
			return false;
		} else {
			features.add(f);
			return true;
		}
	}
}
