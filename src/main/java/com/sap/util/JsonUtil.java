package com.sap.util;

import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sap.constants.Path;
import com.sap.datastruct.WaysJson;

public class JsonUtil {

	public static void main(String[] args) {
		List<String> conts = FileUtil.readFile(Path.result);
		StringBuilder sb = new StringBuilder();
		for(String str : conts) {
			sb.append(str.trim());
		}
		JsonUtil.convertToWaysJson(sb.toString());
	
	}

	/**
	 * 将对象转为json
	 * 
	 * @param w
	 * @return
	 */
	public static String convertToJson(Object w) {
		ObjectMapper mapper = new ObjectMapper();
		String json = null;
		try {
			json = mapper.writeValueAsString(w);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}
	
	public static WaysJson convertToWaysJson(String json) {
		ObjectMapper mapper = new ObjectMapper();
		WaysJson jsonMap = null;
		try {
			jsonMap = mapper.readValue(json,WaysJson.class);
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} //转换为HashMap对象
		return jsonMap;
	}
}
