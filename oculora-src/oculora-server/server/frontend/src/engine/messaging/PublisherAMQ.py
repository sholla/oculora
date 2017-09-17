'''
Created on Dec 28, 2014

@author: Shreesh
'''
'''

 Copyright 2015 Tamaturra Inc.
 
'''
from stompest.config import StompConfig
from stompest.sync import Stomp

class PublisherAMQ(object):
    '''
    classdocs
    '''

    CONFIG = StompConfig('tcp://localhost:61613')
    QUEUE = '/queue/revideomessagesBE'
    
    def __init__(self , selk, selv, config=None, queue=None):
        '''
        Constructor
        '''
        if config is not None:
            self.CONFIG = config
        if queue is not None:
            self.QUEUE = queue
        self.client = Stomp(self.CONFIG)
        self.client.connect()
        self.selk = selk
        self.selv = selv
        
    def send(self, msg):
        #print "Send::: " + self.selector
        self.client.send(self.QUEUE, msg, headers={self.selk : self.selv})
        
    def end(self):
        self.client.disconnect()
        
        
    
        
        