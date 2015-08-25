package com.sap.webSpider;

import java.io.File;
import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.sap.util.FileUtil;
import com.sap.util.PathHelper;

/**
 * 这是个爬虫类，解析njroads.html，获取所有南京公交路线名称，并根据具体路线爬取该路线进过的所有站台名称
 * 
 * @author I319213
 *
 */
public class SpiderTest {
	private final String outFilePath = PathHelper.getCurrentPath() + "\\src\\main\\java\\com\\sap\\webSpider\\roadNameList.txt";
		
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		new SpiderTest().parseFile();
	}

	public void parseFile() {
		String path = PathHelper.getCurrentPath() + "\\src\\main\\java\\com\\sap\\webSpider\\njroads.html";
		File input = new File(path);
		Document doc = null;
		try {
			doc = Jsoup.parse(input, "UTF-8", "");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		//获取所有南京公交路线的连接
		Map<String, String> links = new LinkedHashMap<String, String>();
		Elements es = doc.getElementsByClass("ChinaTxt");
		for(Element e : es) {
			//获取dd标签下所有的<a>标签，即当前首字母选项下的所有公交路线链接信息
			Elements as = e.getElementsByTag("dd").first().getElementsByTag("a");
			for(Element a : as) {
				String href = a.attr("href");
				String name = a.html();
				links.put(name, href);
			}
		}
		
		//获取所有南京公交路线的详细信息，<路线明, 途经站台>
		Map<String, String> roadsDetail = new LinkedHashMap<String, String>();
		List<String> res = new ArrayList<String>();
		for(Entry<String, String> e : links.entrySet()) {
//			System.out.println("name " + e.getKey() + " | link " + e.getValue());
			Document curDoc = connect(e.getValue(), 300);
			Element curE = curDoc.getElementById("stationNames");
			//获取该线路经过的所有station
			String stations = curE.attr("value");
			System.out.println( e.getKey() + "-----" + stations);
			res.add(e.getKey() + ",");
			FileUtil.writeFile(outFilePath, res, false);
			roadsDetail.put(e.getKey(), stations);
		}
	}
	
	public Document connect(String url) {
		Document doc = null;
		try {
			doc = Jsoup.connect(url).get();
		} catch (IOException e) {
			// TODO Auto-generated catch block
//			System.out.println((e instanceof SocketTimeoutException));
			e.printStackTrace();
		}
		return doc;
	}
	
	public Document connect(String url, int timeOut) {
		Document doc = null;
		//抛出时间异常，则增加一倍请求延迟时间
		int getCount = 0;
		while(doc == null) {
			try {
				doc = Jsoup.connect(url)
						.timeout(timeOut + timeOut*getCount)
						.get();
			} catch (IOException e) {
				if(!(e instanceof SocketTimeoutException)) {
					e.printStackTrace();
					break;
				} 
			}
		}
		return doc;
	}
}
