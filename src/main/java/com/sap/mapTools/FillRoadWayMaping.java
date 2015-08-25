package com.sap.mapTools;

import java.util.ArrayList;
import java.util.List;

import com.sap.util.FileUtil;

/**
 * 这个类用来补全 RoadWayMapping 文件
 * 
 * @author I319213
 *
 */
public class FillRoadWayMaping {
	private final static String roads_info = "C:\\Users\\i319213\\Desktop\\osm_adapter\\in\\darmstadt\\roads_info.csv";
	
	private final static String result = "C:\\Users\\i319213\\Desktop\\osm_adapter\\in\\darmstadt\\result.csv";

	private final static String road_way_mapping = "C:\\Users\\i319213\\Desktop\\osm_adapter\\in\\darmstadt\\road_way_mapping.csv";
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		new FillRoadWayMaping().fillRoadWayMapping("1", roads_info, result, road_way_mapping);
	}
	
	public void fillRoadWayMapping(String direction, String roads_info, String result, String road_way_mapping) {
		List<String> output = new ArrayList<String>();
		
		List<String> ri = FileUtil.readFile(roads_info);
		String singleRi = ri.get(ri.size() - 1);
		String seq = singleRi.split(",")[0];
		String wayName = singleRi.split(",")[2];
		
		List<String> res = FileUtil.readFile(result);
		for(int i = 1 ; i <= res.size() ; i++) {
			String sout = seq + "," + wayName + "," + direction + ",";
			sout += res.get(i-1);
			sout += i;
			
			output.add(sout);
		}
		
		FileUtil.writeFile(road_way_mapping, output, true);
	}

}
