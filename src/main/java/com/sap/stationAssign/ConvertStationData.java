package com.sap.stationAssign;

import java.util.ArrayList;
import java.util.List;

import com.sap.util.FileUtil;

/**
 * 这个类用来将320机站源数据转换成stationAssign c++程序所需要的数据格式
 * 
 * @author I319213
 *
 */
public class ConvertStationData {
	private final static String fileIn = "C:\\Users\\i319213\\Desktop\\git-hana\\itraffic-data\\fdd\\nanjing\\fdd_station_2015_with_direction.csv";
			//"C:\\Users\\i319213\\Desktop\\git-hana\\itraffic-data\\fdd\\nanjing\\fdd_station_2015_simple.csv";
	
	private final static String fileOut = "C:\\Users\\i319213\\Desktop\\git-hana\\itraffic-data\\fdd\\nanjing\\fdd_station_2015_with_direction.csv";

	
	public static void main(String[] args) {
//		new ConvertStationData().dataConvert(fileIn, fileOut);
		ConvertStationData c = new ConvertStationData();
		c.dataPosConvert(fileIn, fileOut);
	}

	public void dataConvert(String fileIn, String fileOut) {
		List<String> inData = FileUtil.readFile(fileIn);
		List<String> outData = new ArrayList<String>();
		
		int index = 0;
		for(String str : inData) {
			if(str != null && str.length() > 0) {
				if('#' == str.charAt(0)) {
					index = 0;
				}
				String newStr = "";
				if(index >= outData.size()) {
					newStr = str;
					outData.add(newStr);
				} else {
					newStr = outData.get(index) + "," + str;
					outData.set(index, newStr);
				}
				index++;
			}
		}
		
		FileUtil.writeFile(fileOut, outData, false);
	}
	
	public void dataPosConvert(String fileIn, String fileOut) {
		List<String> cont = FileUtil.readFile(fileIn);
		this.positionChange(cont, 4, 5);
		FileUtil.writeFile(fileOut, cont, false);
	}
	
	private void positionChange(List<String> cont, int index1, int index2) {
		for(int i = 0 ; i < cont.size() ; i++) {
			String tmp[] = cont.get(i).split(",");
			String tStr = tmp[index1];
			tmp[index1] = tmp[index2];
			tmp[index2] = tStr;
			String res = "";
			for(String s : tmp) {
				res += s + ",";
			}
			res = res.substring(0, res.length() - 1);
			cont.set(i, res);
		}
	}
}
