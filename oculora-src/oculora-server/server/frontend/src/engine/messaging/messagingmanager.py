'''
Created on Dec 28, 2014

@author: Shreesh
'''
'''

 Copyright 2015 Tamaturra Inc.
 
'''
from twisted.internet import reactor, defer
from engine.messaging.ConsumerAMQ import ConsumerAMQ
from engine.messaging.PublisherAMQ import PublisherAMQ
import random
#from ctypes.wintypes import FLOAT

class MessagingManager(object):
    '''
    classdocs
    '''
    SELECTOR = "revideosel"
    SELECTORFORMAT = "%.5f"
    
    def __init__(self ):
        '''
        Constructor
        '''
        
    def send(self, msg):
        qn = random.random();
        sel = self.SELECTOR + "=" + self.SELECTORFORMAT % qn
        sel2 = self.SELECTORFORMAT % qn
        recvr = ConsumerAMQ(sel)
        sender = PublisherAMQ(self.SELECTOR, sel2)
        sender.send(msg)
        res = recvr.receive()
        #recvr.end()
        #sender.end()
        return res
    
    def receive(self):
        
        pass
    