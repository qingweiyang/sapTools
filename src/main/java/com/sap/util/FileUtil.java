package com.sap.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class FileUtil {
	 /**
     * 功能：Java读取文件的内容，并返回list格式的文件内容（已文件一行为单位）
     * 步骤：1：先获得文件句柄
     * 2：获得文件句柄当做是输入一个字节码流，需要对这个输入流进行读取
     * 3：读取到输入流后，需要读取生成字节流
     * 4：一行一行的输出。readline()。
     * 备注：需要考虑的是异常情况
     * 
     * @param filePath
	 * @return 
     */
    public static List<String> readFile(String filePath){
    	List<String> rows = new ArrayList<String>();
    	
        try {
                String encoding="utf-8";
                File file=new File(filePath);
                if(file.isFile() && file.exists()){ //判断文件是否存在
                    InputStreamReader read = new InputStreamReader(
                    new FileInputStream(file),encoding);//考虑到编码格式
                    BufferedReader bufferedReader = new BufferedReader(read);
                    String lineTxt = null;
                    while((lineTxt = bufferedReader.readLine()) != null){
//                        System.out.println(lineTxt);
                        rows.add(lineTxt);
                    }
                    read.close();
		        }else{
		            System.out.println("找不到指定的文件");
		        }
        } catch (Exception e) {
            System.out.println("读取文件内容出错");
            e.printStackTrace();
        }
     
        return rows;
    }
     
    /**
     * 写文件到filePath文件中， 这里是追加数据即在原文件最后一行开始写入
     * 
     * @param filePath
     * @param conts
     * 			每个字符串在文件中占一行
     * @param addLast
     * 			是否追加数据即在原文件最后一行开始写入
     */
    public static void writeFile(String filePath, List<String> conts, boolean addLast) {
    	try {
    		File file = new File(filePath);

    		// if file doesnt exists, then create it
    		if (!file.exists()) {
    			file.createNewFile();
    		}

    		FileWriter fw = new FileWriter(file.getAbsoluteFile(), addLast);
    		BufferedWriter bw = new BufferedWriter(fw);
    		for(int i = 0 ; i < conts.size() ; i++) {
    			bw.write(conts.get(i));
    			bw.newLine();
    		}
    		
    		bw.close();
    		} catch (IOException e) {
    			e.printStackTrace();
    	}
    	
    }
     
    /**
     * 写文件到filePath文件中， 这里是追加数据即在原文件最后一行开始写入
     * 
     * @param filePath
     * @param conts
     * @param addLast
     */
    public static void writeFile(String filePath, String conts, boolean addLast) {
    	try {
    		File file = new File(filePath);

    		// if file doesnt exists, then create it
    		if (!file.exists()) {
    			file.createNewFile();
    		}

    		FileWriter fw = new FileWriter(file.getAbsoluteFile(), addLast);
    		BufferedWriter bw = new BufferedWriter(fw);
    		bw.write(conts);
    		
    		bw.close();
    		} catch (IOException e) {
    			e.printStackTrace();
    	}
    	
    }
}