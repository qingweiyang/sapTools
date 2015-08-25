package com.sap.mapTools;

import java.util.List;

import com.sap.util.FileUtil;

/**
 * 这个类用来删除 RoadWayMapping.csv 与roads_info.csv 文件先关路信息
 * 
 * #result 格式：
 * Münchweg
 * Schützenhaus
 * 
 * @author I319213
 *
 */
public class RemoveRoadWayMaping {
	private final static String roads_info = "C:\\Users\\i319213\\Desktop\\osm_adapter\\in\\darmstadt\\roads_info.csv";
	
	private final static String result = "C:\\Users\\i319213\\Desktop\\osm_adapter\\in\\darmstadt\\result.csv";

	private final static String road_way_mapping = "C:\\Users\\i319213\\Desktop\\osm_adapter\\in\\darmstadt\\road_way_mapping.csv";
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		new RemoveRoadWayMaping().remove(result, roads_info, road_way_mapping);
	}
	
	public void remove(String result, String roads_info, String road_way_mapping) {
		List<String> input = FileUtil.readFile(result);
		List<String> roadsInfoCSV = FileUtil.readFile(roads_info);
		List<String> roadsWayMappingCSV = FileUtil.readFile(road_way_mapping);
		
		for(String in : input) {
			String id = null;
			for(String ricsv : roadsInfoCSV) {
				String temp = ricsv.split(",")[2];
				if(in.equals(temp)) {
					//找到要删除的路
					id = ricsv.split(",")[0];
					roadsInfoCSV.remove(ricsv);
					break;
				}
			}
			System.out.println("id----"+id);
			if(id != null) {
				for(int i = 0 ; i < roadsWayMappingCSV.size() ; i++) {
					String temp = roadsWayMappingCSV.get(i).split(",")[0];
					if(temp.equals(id)) {
						roadsWayMappingCSV.remove(roadsWayMappingCSV.get(i));
						i--;
					}
				}
			}
		}
		
		//写文件，这里清空原文件再写入
		FileUtil.writeFile(roads_info, roadsInfoCSV, false);
		FileUtil.writeFile(road_way_mapping, roadsWayMappingCSV, false);
	}

}
