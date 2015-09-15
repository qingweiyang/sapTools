package com.sap.jdbcServer;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import com.sap.nic.db.ConnectionPool;

public class Test {
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		new Test().test();
	}

	public void testHana() {
		ConnectionPool c = ConnectionPool.getInstance();
		try {
			Connection conn = c.getConnection();
			conn.prepareStatement("create table SMK_BUS_DATA_20140521_ALIAS(GETONOFFDATETIME timestamp, ALIASCARDNO VARCHAR(18), CARID VARCHAR(34), PAYMENTAMOUNT INTEGER, T_STAMP timestamp, RESERVED VARCHAR(12), CARDCLASS VARCHAR(3))").execute();
			conn.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public void test() {
		ConnectionFactory factory = ConnectionFactory.getConnFactoryInstance(ConnectionFactory.ORACLE_DB);
		Connection conn = factory.getConn();
		
		ConnectionPool c = ConnectionPool.getInstance();
		
		try {
			PreparedStatement pst = conn.prepareStatement("select * from SMK_BUS_DATA_20140521_ALIAS");
			java.sql.ResultSet rs = pst.executeQuery();
	
			Connection chana = c.getConnection();
//			int i = 10;
			while (rs.next()) {
				PreparedStatement p = chana.prepareStatement("insert into SMK_BUS_DATA_20140521_ALIAS values(?, ?, ?, ?, ?, ?, ?)");
				p.setTimestamp(1, rs.getTimestamp(1));
				p.setString(2, rs.getString(2));
				p.setString(3, rs.getString(3));
				p.setInt(4, rs.getInt(4));
				p.setTimestamp(5, rs.getTimestamp(5));
				p.setString(6, rs.getString(6));
				p.setString(7, rs.getString(7));
				p.execute();
				
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
