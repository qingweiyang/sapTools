package com.sap.stationAssign;

import java.util.List;

import com.sap.datastruct.Features;
import com.sap.datastruct.WaysJson;
import com.sap.util.FileUtil;
import com.sap.util.JsonUtil;

public class ConvertGeojson {
	private final static String fileIn = "C:\\Users\\i319213\\Desktop\\fdd_station_2015.json";
	
	private final static String fileOut = "‪C:\\Users\\i319213\\Desktop\\result.csv";

	public static void main(String[] args) {
		List<String> conts = FileUtil.readFile("C:\\Users\\i319213\\Desktop\\Test Data\\testData.xlsx");
		for(String str : conts) {
			System.out.println(str);
		}
		new ConvertGeojson().getGeojson(fileIn, fileOut, 0, 2);
//		List<String> conts = FileUtil.readFile(fileIn);
		System.out.println(conts.size());
	}

	public void getGeojson(String fileIn, String fileOut, int start, int last) {
		List<String> conts = FileUtil.readFile(fileIn);
		StringBuilder sb = new StringBuilder();
		for(String str : conts) {
			sb.append(str.trim());
		}
		String tmp = sb.toString().replaceAll("district_id/name", "district_id_name");
		tmp = tmp.toString().replaceAll("seg_id", "segment_id");
		
		WaysJson w = JsonUtil.convertToWaysJson(tmp);
		WaysJson nw = new WaysJson();
		List<Features> fs = w.getfeatures();
		
		for(int i = start; i <= last; i++) {
			nw.addFeatures(fs.get(i));
		}
		
		String json = JsonUtil.convertToJson(nw);
		//System.out.println(json);
		FileUtil.writeFile(fileOut, json, false);
	}
}
