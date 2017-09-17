/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data;

import com.mongodb.MongoClient;
import com.mongodb.MongoException;
import com.mongodb.ServerAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.data.authentication.UserCredentials;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;

/**
 *
 * @author sholla
 */
public class CDataManager {
    //public static final String PRIMARY_MONGODB_HOST = "ec2-54-245-8-147.us-west-2.compute.amazonaws.com";
    /*public static final List<ServerAddress> PRIMARY_MONGODB_HOST = Arrays.asList(
   new ServerAddress("localhost", 27017),
   new ServerAddress("localhost", 27018)
   );*/
   public static final String PRIMARY_MONGODB_REPLSET = "revideomaindb";
   public static final String PRIMARY_MONGODB_HOST_1 = "108.168.231.171";
   public static final String PRIMARY_MONGODB_HOST_2 = "108.168.231.170";
   //public static final int PRIMARY_MONGODB_PORT = 27017;
   public static final int PRIMARY_MONGODB_PORT = 27018;
   public static final String PRIMARY_MONGODB_USERNAME = "admin";
   public static final String PRIMARY_MONGODB_PASSWORD = "Pcux4gVx";
   
   public static final String PRIMARY_MONGODB_HOST = "localhost";
   
    //static final String PRIMARY_MONGODB_HOST = "localhost";
    static final String MONGO_DB_NAME_P2P = "revideo-p2p";
    static final String MONGO_DB_NAME_PAY = "revideo-pay";
    static final String MONGO_DB_NAME_USER = "revideo-user";
    
    public enum MongoDbNamesIndexE
    {
        MongoDbNamesIndex_P2p,
        MongoDbNamesIndexE_Pay,
        MongoDbNamesIndexE_User,
        
    }
    static final String[] MONGO_DB_NAMES = {MONGO_DB_NAME_P2P, MONGO_DB_NAME_PAY, MONGO_DB_NAME_USER};
    public static MongoOperations[] mongoOperations = new MongoOperations[MONGO_DB_NAMES.length];
    
    static MongoClient mMongoClient;;
    //static Mongo.Holder mMongoHolder;
                    
    public synchronized static boolean Configure(boolean inLocal)
    {
        
        
        UserCredentials uc = new UserCredentials(PRIMARY_MONGODB_USERNAME, PRIMARY_MONGODB_PASSWORD);
        if(mMongoClient == null)
            try {
                List<ServerAddress> asList = Arrays.asList(
                                             new ServerAddress(PRIMARY_MONGODB_HOST_1, PRIMARY_MONGODB_PORT),
                                             new ServerAddress(PRIMARY_MONGODB_HOST_2, PRIMARY_MONGODB_PORT));
                
                        //MongoClientURI connURI = new MongoClientURI("mongodb://" + PRIMARY_MONGODB_USERNAME + ":" + PRIMARY_MONGODB_PASSWORD + "@"+ PRIMARY_MONGODB_HOST_1  + ":" + PRIMARY_MONGODB_PORT + "," + PRIMARY_MONGODB_HOST_2 + ":" + PRIMARY_MONGODB_PORT + "/admin?replicaSet=" + PRIMARY_MONGODB_REPLSET);
                /*MongoClientOptions.Builder mcob = new MongoClientOptions.Builder();
                mcob.autoConnectRetry(true);
                mcob.socketKeepAlive(true);
                MongoClientOptions mco = mcob.build();*/
                if(inLocal != false)
                    mMongoClient = new MongoClient(PRIMARY_MONGODB_HOST, PRIMARY_MONGODB_PORT);
                else
                    mMongoClient = new MongoClient(asList);
                
                //mMongoHolder = Mongo.Holder.singleton();
                //mMongoHolder = Mongo.Holder.singleton().connect( new MongoURI("mongodb://localhost" ) );
        } catch (UnknownHostException ex) {
            Logger.getLogger(CDataManager.class.getName()).log(Level.SEVERE, null, ex);
            return false;
        }
                    
        try {
            
        	mMongoClient.getDB("admin").authenticate(uc.getUsername(), uc.getPassword().toCharArray());
            MongoOperations mop = new MongoTemplate(mMongoClient, "admin", uc);
            mongoOperations[MongoDbNamesIndexE.MongoDbNamesIndex_P2p.ordinal()] = new MongoTemplate(mMongoClient, MONGO_DB_NAME_P2P);
            mongoOperations[MongoDbNamesIndexE.MongoDbNamesIndexE_Pay.ordinal()] = new MongoTemplate(mMongoClient, MONGO_DB_NAME_PAY);
            mongoOperations[MongoDbNamesIndexE.MongoDbNamesIndexE_User.ordinal()] = new MongoTemplate(mMongoClient, MONGO_DB_NAME_USER);
            

        } catch (MongoException ex) {
            Logger.getLogger(CDataManager.class.getName()).log(Level.SEVERE, null, ex);
            return false;
        } catch (Exception ex) {
            Logger.getLogger(CDataManager.class.getName()).log(Level.SEVERE, null, ex);
            return false;
        }
        
        return true;
        
    }
    
    public static void DropDB(MongoDbNamesIndexE dbt)
    {
        mMongoClient.getDB(MONGO_DB_NAMES[dbt.ordinal()]).dropDatabase();
    }
}
