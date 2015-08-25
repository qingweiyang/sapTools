package com.sap.util;

public class PathHelper {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		System.out.println(PathHelper.getCurrentPath());
	}
	
	public static String getCurrentPath() {
		return System.getProperty("user.dir");
	}
	
}
