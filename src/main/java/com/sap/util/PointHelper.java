package com.sap.util;

public class PointHelper {

	public static void main(String[] args) {
	}

	/**
	 * 计算方位角pab
	 * http://lszdb1983.blog.163.com/blog/static/20426348201273084842686/
	 * eg: gps2d(32.058758, 118.985313, 32.058778, 118.985556)
	 * 
	 * @param lat_a
	 * @param lng_a
	 * @param lat_b
	 * @param lng_b
	 * @return
	 */
	public static double gps2d(double lat_a, double lng_a, double lat_b, double lng_b) {
		lat_a = lat_a * 100000;
		lng_a = lng_a * 100000;
		lat_b = lat_b * 100000;
		lng_b = lng_b * 100000;
		double d = 0;
		lat_a=lat_a*Math.PI/180;
		lng_a=lng_a*Math.PI/180;
		lat_b=lat_b*Math.PI/180;
		lng_b=lng_b*Math.PI/180;
	         
		d=Math.sin(lat_a)*Math.sin(lat_b)+Math.cos(lat_a)*Math.cos(lat_b)*Math.cos(lng_b-lng_a);
		d=Math.sqrt(1-d*d);
		d=Math.cos(lat_b)*Math.sin(lng_b-lng_a)/d;
		d=Math.asin(d)*180/Math.PI;
	  
		return d;
	}
}
