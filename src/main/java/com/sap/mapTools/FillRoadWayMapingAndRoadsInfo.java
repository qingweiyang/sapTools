package com.sap.mapTools;

import java.util.ArrayList;
import java.util.List;

import com.sap.util.FileUtil;

/**
 * 这个类根据newMaptools自动生成的Result.csv文件来补全 RoadWayMapping.csv 与roads_info.csv 文件
 * 
 * @author I319213
 *
 */
public class FillRoadWayMapingAndRoadsInfo {
	private final static String roads_info = "C:\\Users\\i319213\\Desktop\\osm_adapter\\in\\darmstadt\\roads_info.csv";
	
	private final static String result = "C:\\Users\\i319213\\Downloads\\Result.csv";

	private final static String road_way_mapping = "C:\\Users\\i319213\\Desktop\\osm_adapter\\in\\darmstadt\\road_way_mapping.csv";
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		new FillRoadWayMapingAndRoadsInfo().fillRoadWayMappingAndRoadsInfo(result, roads_info, road_way_mapping);
	}
	
	public void fillRoadWayMappingAndRoadsInfo(String result, String roads_info, String road_way_mapping) {	
		//获取当前新增roads编号
		List<String> roadsInfoCSV = FileUtil.readFile(roads_info);
		int id = 1;
		for(int i = roadsInfoCSV.size() - 1 ; i >= 0 ; i--) {
			String temp = roadsInfoCSV.get(i);
			if(!temp.equals("")) {
				id = Integer.parseInt(temp.split(",")[0]);
				System.out.println("current id = "+id);
				break;
			} 
		}
		
		List<String> resultCSV = FileUtil.readFile(result);
		//要输出到roads_info.csv的内容
		List<String> roadsInfoOutput = new ArrayList<String>();
		//要输出到roads_way_mapping.csv的内容
		List<String> roadsWayMappingOutput = new ArrayList<String>();
		String preWay = "";
		for(String str : resultCSV) {
			String seg[] = str.split(",");
			
			//输出到roads_info.csv，排查重复
			if(!preWay.equals(seg[1])) {
				String curS = (++id) + ",," +seg[1] + ",";
				roadsInfoOutput.add(curS);
				preWay = seg[1];
			}
			
			//输出到roads_way_mapping只需要改变序号
			String s2 = id + "";
			for(int i = 1 ; i < seg.length ; i++) {
				s2 += ","+seg[i];
			}
			roadsWayMappingOutput.add(s2);
		}
		
		FileUtil.writeFile(roads_info, roadsInfoOutput, true);
		FileUtil.writeFile(road_way_mapping, roadsWayMappingOutput, true);
	}

}
