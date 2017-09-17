'''
Created on Dec 28, 2014

@author: Shreesh
'''
'''

 Copyright 2015 Tamaturra Inc.
 
'''
from stompest.config import StompConfig
from stompest.protocol import StompSpec
from stompest.sync import Stomp

class ConsumerAMQ(object):
    '''
    classdocs
    '''

    CONFIG = StompConfig('tcp://localhost:61613')
    QUEUE = '/queue/revideomessagesFE'
    
    FRAMEBODY = "MESSAGE"
    
    def __init__(self , sel, config=None, queue=None):
        '''
        Constructor
        '''
        
        if config is not None:
            self.CONFIG = config
        if queue is not None:
            self.QUEUE = queue
        self.selector = sel
        self.client = Stomp(self.CONFIG)
        self.client.connect()
        self.client.subscribe(self.QUEUE, {StompSpec.ACK_HEADER: StompSpec.ACK_CLIENT_INDIVIDUAL, "selector" : self.selector})
    
    def receive(self):
        frame = None
        cnt = 5
        while True:
            frame = self.client.receiveFrame()
            #print "frame: " + frame.info()
            if frame.command == self.FRAMEBODY:
                self.client.ack(frame)
                
                break
            frame = None
            cnt = cnt - 1
            if cnt <= 0:
                break
        if frame is None:
            return frame
        else:
            return frame.body
    def end(self):
        self.client.disconnect()
        
        
    
        
        