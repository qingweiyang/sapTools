package com.sap.jdbcServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;
import java.util.UUID;

import com.sap.util.PathHelper;

public class ConnectionFactory {
	private final String proPath = PathHelper.getCurrentPath() + "\\src\\main\\java\\com\\sap\\jdbcServer\\db-conn-param.properties";
	
	/**
	 * 驱动
	 */
	private String driver;
	
	/**
	 * 连接字符串
	 */
	private String url;
	
	/**
	 * 数据库登录用户名称
	 */
	private String username;
	
	/**
	 * 数据库登录密码
	 */
	private String password;
	
	private String db;
	
	/**
	 * 常量代表"ORACLE"
	 */
	public final static String ORACLE_DB = "oracle";
	
	/**
	 * 常量代表"MYSQL"
	 */
	public final static String MYSQL_DB = "mysql";	
	
	/**
	 * 单例模式 获取一个数据库连接工厂
	 */
	private static ConnectionFactory connFactory = null;
	
	public static synchronized ConnectionFactory getConnFactoryInstance(String db){
		if(connFactory == null){
			connFactory = new ConnectionFactory(db);
		}
		return connFactory;
	}
	
	private ConnectionFactory(String db){
		try {
			initOrclParams(db);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 通过配置文件获取数据库连接参数
	 * @param db 数据库名称
	 * @throws IOException
	 */
	private void initOrclParams(String db) throws IOException{
		Properties properties = new Properties();

		InputStream in = new FileInputStream(new File(proPath));
		properties.load(in);
	
		if(db.equals(ORACLE_DB))
		{
			getParams(properties,db);
		}
		else if(db.equals(MYSQL_DB))
		{
			getParams(properties,db);
		}
	}
	
	/**
	 * 根据数据库名获取相应的参数
	 * @param p Properties
	 * @param db 
	 */
	private void getParams(Properties p,String db){
		//注意：如果不用trim(),这样properties文件中的字符串后面不能有空格，否则会出错
		driver = p.getProperty(db + ".driver").trim();
		url = p.getProperty(db + ".url").trim();
		username = p.getProperty(db + ".username").trim();
		password = p.getProperty(db + ".password").trim();
	}
	
	/**
	 * 获取连接对象
	 * @param db 连接的数据库名 取值于ConnectionFactory中的常量：ORCL_DB/MYSQL_DB
	 * @return
	 */
	public Connection getConn()
	{
		Connection conn = null;
		
		try 
		{
			Class.forName(driver);
			conn = DriverManager.getConnection(url, username, password);
			// 设置不自动提交
			conn.setAutoCommit(false);
		} 
		catch (ClassNotFoundException e) 
		{
			e.printStackTrace();
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		} 
		
		return conn;
	}

	/**
	 * 关闭操作
	 * @param conn
	 * @param pst
	 * @param rs
	 */
	public static void close(Connection conn, PreparedStatement pst, ResultSet rs) {
		try {
			if (rs != null) {
				rs.close();
			}
			if (pst != null) {
				pst.close();
			}
			if (conn != null) {
				conn.close();
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 获取UUID
	 * @return
	 */
	public String getUUID() {
		return UUID.randomUUID().toString();
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
	
	public String getDriver() {
		return driver;
	}

	public void setDriver(String driver) {
		this.driver = driver;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public String getDb() {
		return db;
	}

	public void setDb(String db) {
		this.db = db;
	}

}
