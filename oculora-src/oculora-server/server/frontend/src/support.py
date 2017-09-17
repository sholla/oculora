'''
Created on Dec 27, 2014

@author: Shreesh
'''
'''

 Copyright 2015 Tamaturra Inc.
 
'''
from enum import Enum
ApiMethods1 = Enum('ApiMethods1', 'Api_Invalid Api_Login Api_UserProfile Api_RemoveUser Api_GetUser Api_OpenRoom Api_RemoveRoom Api_FollowModel Api_ListRoom Api_PubCandidates Api_ActiveSubCandidates Api_StartSession Api_SubscribeSession Api_EndSession Api_Credits')

FieldDict = {'APIMETHOD': 'apiMethod', 'ADID': 'adid', 'DATA': 'data', 'IMAGEFILE': 'imageFile', 'IMAGES': 'images', 'MODELID': 'mid', 'PAGE': 'pg', 'SORTON': 'so', 'SORTORDER': 'sor', 'SORTDATA': 'sd', 'SEARCHMODE': 'sm', 'TOKTYPE': 'st'};
FieldHeaderDict = {'ADID': 'adid', 'DATA': 'data', 'FILE': 'file'};
FieldResponseDict = {'MESSAGE': 'message', 'RESULT': 'result', 'OK': 'OK'}
FieldResponseValuesDict = {'OK': 2}
'''
class AutoNumber(Enum):
    def __new__(cls):
        value = len(cls.__members__) + 1
        obj = object.__new__(cls)
        obj._value_ = value
        return obj
    

class ApiMethods(AutoNumber):
    Api_Invalid = ()
    
    Api_Login = ()
    
    
    
    Api_PubCandidates = ()
    Api_UserProfile = ()
    
    Api_Code = ()
    
    
    Api_Contacts = ()
    
    
    Api_CreateAcct = ()
    Api_ChangeAcct = ()
    Api_ForgotPW = ()
    Api_ForgotUserName = ()
    
    Api_Logout = ()
    Api_CreateHouse = ()
    Api_UpdateHouse = ()
    Api_DeleteHouse = ()
    Api_CreateRoom = ()
    Api_UpdateRoom = ()
    Api_DeleteRoom = ()
    Api_RoomToken = ()
    Api_RoomTokenEnd = ()
    Api_Purchase = ()
    Api_PurchaseComplete = ()
    Api_Consume = ()
    Api_ConsumeEnded = ()
    Api_Auth = ()
    
    Api_Info_House = ()
    Api_Info_Room = ()

'''