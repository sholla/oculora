#!/usr/bin/python
'''

 Copyright 2015 Tamaturra Inc.
 
'''
from gevent import monkey; monkey.patch_all()
from bottle import route, run, template, static_file, request, Bottle
import bottle
import json
import os
import urllib
from json import JSONEncoder
import base64
#from opentok import OpenTok
from io import FileIO
import uuid
import fnmatch
import shutil
import tempfile
import string

from engine.messaging.messagingmanager import MessagingManager
import support


#try:
#    api_key = os.environ['API_KEY']
#    api_secret = os.environ['API_SECRET']
#except Exception:
#    raise Exception('You must define API_KEY and API_SECRET environment variables')

#opentok = OpenTok(api_key, api_secret)
msgMgr = MessagingManager()


@route('/test')
def test():
	#print request.headers
	msg = '{"abc89": 191}'
	token = msgMgr.send(msg)
	adid = request.get_header("adid", None)
	print adid
	return token 
	
#All requests have header fields of: the app/device token
#Login token is a header field too - TBD

'''
#login: 
INPUT: None
OUTPUT: JSON object as follows:
format
{
	"lt": <logintoken>,
	"ak": <OPENTOK API KEY>,
	"asi": <Admin Session ID>
}
'''
@route('/access/login', method='POST')
def login():
	
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	data = request.forms.items()[0]
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_Login.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	print msg
	token = msgMgr.send(msg)
	print token
	
	return token 

'''
#userprofile: 
INPUT: JSON as follows:
NOT USED {
	"ph": <phone number> #user's phone number
}
{
	"name": <Name> # user name
	"nn": <Name> # nickname
	"kws": <list of keywords> #keywords/phrases list
}
OUTPUT: None
'''
# NOT USED @route('/access/register/number', method='POST')
@route('/user/profile', method='POST')
def userprofile():
	#print len(base64.b64decode(request.forms.get("file")))
	'''
	#print request.forms.keys()
	data = JSONEncoder().encode(request.forms.items()[0])
	print data
	#print request.forms.items()[0]
	return ""
	print str(request.content_length)
	#print len(request.files.get("file"))
	file1 = request.files.get("file")
	print file1.filename
	adid = request.get_header("adid", None)
	print adid
	return ""
	data = request.forms.items()[0]
	print request.forms.items()[0]
	'''
	print request.forms.items()[0]
	data = request.forms.items()[0]
	
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_UserProfile.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	print msg
	token = msgMgr.send(msg)
	return token 

@route('/user/profile/image', method='POST')
def userprofileimage():
	#print len(base64.b64decode(request.forms.get("file")))
	'''
	#print request.forms.keys()
	data = JSONEncoder().encode(request.forms.items()[0])
	print data
	#print request.forms.items()[0]
	return ""
	print str(request.content_length)
	#print len(request.files.get("file"))
	file1 = request.files.get("file")
	print file1.filename
	adid = request.get_header("adid", None)
	print adid
	return ""
	data = request.forms.items()[0]
	print request.forms.items()[0]
	
	print request.forms.items()[0]
	data = request.forms.items()[0]
	
	adid = request.get_header("adid", None)
	if adid is None:
		return None
	msg = JSONEncoder().encode({"apiMethod":ApiMethods1.Api_UserProfile.value - 1, "adid":adid, "data": data})
	print msg
	token = msgMgr.send(msg)
	return token 
	'''
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	file1 = request.files.get(support.FieldHeaderDict['FILE'])
	#print request.files.items()
	extList = os.path.splitext(file1.filename)
	print extList
	ext = string.split(extList[1], "?")
	#print ext
	(fd, filename) = tempfile.mkstemp(prefix="user", dir="/cygdrive/c/projects/revideo/software/server/frontend/data/users", suffix=ext[0])
	fileList = os.path.split(filename)
	print fileList
	file3 = file1.file
	fd1 = os.fdopen(fd, "w")
	fd1.write(file3.read())
	fd1.close()
	
	data = JSONEncoder().encode({support.FieldDict['IMAGEFILE']: '/user/profile/image/' + fileList[1]})
	print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_UserProfile.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	print msg
	token = msgMgr.send(msg)
	print token
	return token 

	'''
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	file1 = request.files.get(support.FieldHeaderDict['FILE'])
	file3 = file1.file
	#print file1.filename
	filename = adid + file1.filename
	svfile = os.path.join("/cygdrive/c/projects/revideo/software/server/frontend/data/users", filename);
	file2 = FileIO(svfile, "w")
	file2.write(file3.read())
	
	data = JSONEncoder().encode({support.FieldDict['IMAGEFILE']: '/user/profile/image/' + filename})
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_UserProfile.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	print msg
	token = msgMgr.send(msg)
	return token 
	#file1.save("/cygdrive/c/projects/revideo/software/server/frontend/src/test")
	return ""
	'''
@route('/user/profile/image/:filename')
def userprofileimageget(filename):
	
	return static_file(filename, "/cygdrive/c/projects/revideo/software/server/frontend/data/users")
'''
removeuser: removes the user profile
INPUT: JSON as follows:
{
	"mid": <id> # User id
}
OUTPUT: return true/false
POST method
'''
@route('/user/profile/remove', method='POST')
def removeuser():
    data = request.forms.items()[0]
    print data
    adid = request.get_header(support.FieldHeaderDict['ADID'], None)
    if adid is None:
		return None
    msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_RemoveUser.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
    #msg = '{"apiMethod": ApiMethods1.Api_OpenRoom1.value - 1, "adid":%s, "data": %s}' % (adid, data)
    token = msgMgr.send(msg)
    
    t1 = json.loads(token)
    t2 = t1[support.FieldResponseDict['RESULT']]
    if t2 != support.FieldResponseValuesDict['OK'] :
    	return token
    
    '''
    t2 = t1[FieldResponseDict['MESSAGE']]
    t3 = json.loads(t2)
    t4 = t3[FieldDict['IMAGES']]
    for f in t4:
    	os.remove(f)
    t1[FieldResponseDict['MESSAGE']] = FieldResponseDict['OK']
    '''
    for f in os.listdir('/cygdrive/c/projects/revideo/software/server/frontend/data/users'):
		if fnmatch.fnmatch(f, adid + '*'):
			os.remove(f)
			break
    return token 
   
'''
#getUser: get user's profile info
INPUT: userId
OUTPUT: JSON object as follows:
format
{
	profile JSON for user with complete profile info for user if user's 
	info asked by user itself. Else brief public info is sent back
}
'''
@route('/user/profile/retrieve', method='POST')
def getUser():
	data = request.forms.items()[0]
	print data
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	
	#userId = request.get_header(support.FieldDict['MODELID'], None)
	#if userId is None:
	#	return None
	#data = JSONEncoder().encode({ support.FieldDict['PAGE']: int(pg)})
	#print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_GetUser.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	
	token = msgMgr.send(msg)
	print token
	return token 


'''
openroom: creates/updates the room entity
INPUT: JSON as follows:
{
	"name": <Name> # Room name
	"description": <descr> # description
	"kws": <list of keywords> #keywords/phrases list for the room/request
	"enabled": <true/false> # enable/disable the room
}
OUTPUT: return unique roomid
POST method
'''
@route('/model/room', method='POST')
def openroom():
    data = request.forms.items()[0]
    print data
    adid = request.get_header(support.FieldHeaderDict['ADID'], None)
    if adid is None:
		return None
    msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_OpenRoom.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
    #msg = '{"apiMethod": ApiMethods1.Api_OpenRoom1.value - 1, "adid":%s, "data": %s}' % (adid, data)
    token = msgMgr.send(msg)
    return token 

@route('/model/room/image', method='POST')
def roomimage():
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	'''
	svpath = os.path.join("/cygdrive/c/projects/revideo/software/server/frontend/data/rooms", adid)
	exists = os.path.exists(svpath)
	if exists != True:
		os.mkdir(svpath)
	file1 = request.files.get(support.FieldHeaderDict['FILE'])
	file3 = file1.file
	print file1.filename
	filename = file1.filename
	svfile = os.path.join(svpath, filename);
	file2 = FileIO(svfile, "w")
	file2.write(file3.read())
	'''
	file1 = request.files.get(support.FieldHeaderDict['FILE'])
	extList = os.path.splitext(file1.filename)
	#print extList
	ext = string.split(extList[1], "?")
	#print ext
	(fd, filename) = tempfile.mkstemp(prefix="room", dir="/cygdrive/c/projects/revideo/software/server/frontend/data/rooms", suffix=ext[0])
	fileList = os.path.split(filename)
	print fileList
	file3 = file1.file
	fd1 = os.fdopen(fd, "w")
	fd1.write(file3.read())
	fd1.close()
	
	modelId = request.get_header(support.FieldDict['MODELID'], None)
	if modelId is None:
		return None
	data = JSONEncoder().encode({support.FieldDict['IMAGES']: ['/model/room/image/' + fileList[1]], support.FieldDict['MODELID']: modelId})
	print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_OpenRoom.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	print msg
	token = msgMgr.send(msg)
	print token
	return token 
	#file1.save("/cygdrive/c/projects/revideo/software/server/frontend/src/test")
	return ""

@route('/model/room/image/:filename')
def roomimageget(filename):
	'''
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	print adid
	if adid is None:
		return None
	'''
	#svfile = os.path.join("/cygdrive/c/projects/revideo/software/server/frontend/data/rooms", filename);
	return static_file(filename, "/cygdrive/c/projects/revideo/software/server/frontend/data/rooms")

'''
removeroom: removes the room entity
INPUT: JSON as follows:
{
	"mid": <id> # Room id
}
OUTPUT: return true/false
POST method
'''
@route('/model/room/remove', method='POST')
def removeroom():
    data = request.forms.items()[0]
    print data
    adid = request.get_header(support.FieldHeaderDict['ADID'], None)
    if adid is None:
		return None
    msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_RemoveRoom.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
    #msg = '{"apiMethod": ApiMethods1.Api_OpenRoom1.value - 1, "adid":%s, "data": %s}' % (adid, data)
    token = msgMgr.send(msg)
    t1 = json.loads(token)
    t2 = t1[support.FieldResponseDict['RESULT']]
    if t2 != support.FieldResponseValuesDict['OK' ]:
    	return token
    svfile = os.path.join("/cygdrive/c/projects/revideo/software/server/frontend/data/rooms", adid);
    shutil.rmtree(svfile, ignore_errors=True)
    '''
    t1 = json.loads(token)
    t2 = t1[support.FieldResponseDict['MESSAGE']]
    t3 = json.loads(t2)
    t4 = t3['images']
    for f in t4:
    	os.remove(f)
    t1[support.FieldResponseDict['MESSAGE']] = support.FieldResponseDict['OK']
    '''
    return token 
   
'''
followmodel: follow a room/user
INPUT: JSON as follows:
{
	"mid": <id> # Room/user id
	"type": 0 for user following a room, 1 for room following a user, 2 for user-user follow
}
OUTPUT: return JSON with follow state
POST method
'''
@route('/model/room/follow', method='POST')
def followmodel():
    adid = request.get_header(support.FieldHeaderDict['ADID'], None)
    if adid is None:
    	return None
    print request.forms.items
    data = request.forms.items()[0]
    #data2 = data
    #print "1:" + data
    #msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_FollowModel.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
    msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_FollowModel.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
    #msg = '{"apiMethod": ApiMethods1.Api_OpenRoom1.value - 1, "adid":%s, "data": %s}' % (adid, data)
    token = msgMgr.send(msg)
    print token
    return token 

'''
#getRooms: get user's available rooms
INPUT: page #
OUTPUT: JSON object as follows:
format
{
	rooms JSON in blocks of 10
}
'''
@route('/model/room/list')
def getRooms():
	pg = request.params[support.FieldDict['PAGE']]
	sortOrder = request.params[support.FieldDict['SORTORDER']]
	sortOn = request.params[support.FieldDict['SORTON']]
	sortData = None
	if support.FieldDict['SORTDATA'] in request.params:
		sortData = request.params[support.FieldDict['SORTDATA']]
	reqObj = {support.FieldDict['PAGE']: int(pg), support.FieldDict['SORTORDER']: int(sortOrder), support.FieldDict['SORTON']: int(sortOn)}
	if sortData is not None:
		reqObj[support.FieldDict['SORTDATA']] = sortData
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	#userId = request.get_header(support.FieldDict['MODELID'], None)
	#if userId is None:
	#	return None
	data = JSONEncoder().encode(reqObj)
	print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_ListRoom.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	
	token = msgMgr.send(msg)
	print token
	return token 

'''
#pubCandidates: get available publishable rooms
INPUT: page #
OUTPUT: JSON object as follows:
format
{
	rooms JSON in blocks of 10
	
}
'''
@route('/model/publish/candidates')
def pubCandidates():
	pg = request.params[support.FieldDict['PAGE']]
	sortFilter = request.params[support.FieldDict['SEARCHMODE']]
	sortOrder = request.params[support.FieldDict['SORTORDER']]
	sortOn = request.params[support.FieldDict['SORTON']]
	sortData = None
	if support.FieldDict['SORTDATA'] in request.params:
		sortData = request.params[support.FieldDict['SORTDATA']]
	reqObj = {support.FieldDict['PAGE']: int(pg), support.FieldDict['SEARCHMODE']: int(sortFilter), support.FieldDict['SORTORDER']: int(sortOrder), support.FieldDict['SORTON']: int(sortOn)}
	if sortData is not None:
		reqObj[support.FieldDict['SORTDATA']] = sortData
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	#userId = request.get_header(support.FieldDict['MODELID'], None)
	#if userId is None:
	#	return None
	data = JSONEncoder().encode(reqObj)
	print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_PubCandidates.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	
	token = msgMgr.send(msg)
	print token
	return token  

'''
#subCandidates: get available subscribable rooms
INPUT: page #
OUTPUT: JSON object as follows:
format
{
	rooms JSON in blocks of 10
	
}
'''
@route('/model/subscribe/candidates/active')
def activesubCandidates():
	pg = request.params[support.FieldDict['PAGE']]
	sortFilter = request.params[support.FieldDict['SEARCHMODE']]
	sortOrder = request.params[support.FieldDict['SORTORDER']]
	sortOn = request.params[support.FieldDict['SORTON']]
	sortData = None
	if support.FieldDict['SORTDATA'] in request.params:
		sortData = request.params[support.FieldDict['SORTDATA']]
	reqObj = {support.FieldDict['PAGE']: int(pg), support.FieldDict['SEARCHMODE']: int(sortFilter), support.FieldDict['SORTORDER']: int(sortOrder), support.FieldDict['SORTON']: int(sortOn)}
	if sortData is not None:
		reqObj[support.FieldDict['SORTDATA']] = sortData
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	#userId = request.get_header(support.FieldDict['MODELID'], None)
	#if userId is None:
	#	return None
	data = JSONEncoder().encode(reqObj)
	print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_ActiveSubCandidates.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	
	token = msgMgr.send(msg)
	print token
	return token 
	
'''
#startSession: get token for using WebRTC channels
INPUT: userId, token type, room ID
OUTPUT: JSON object as follows:
format
{
	tokens if allowed to pub/sub. If not allowed error return
}
'''
@route('/model/room/session/start', method='POST')
def startSession():
	data = request.forms.items()[0]
	print data
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	
	#userId = request.get_header(support.FieldDict['MODELID'], None)
	#if userId is None:
	#	return None
	#data = JSONEncoder().encode({ support.FieldDict['PAGE']: int(pg)})
	#print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_StartSession.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	print msg
	token = msgMgr.send(msg)
	print token
	return token

'''
#subscribeSession: get token for subscribers to using WebRTC channels
INPUT: userId, room ID, fullscreen
OUTPUT: JSON object as follows:
format
{
	tokens if allowed to pub/sub. If not allowed error return
}
'''
@route('/model/room/session/subsession', method='POST')
def subscribeSession():
	data = request.forms.items()[0]
	print data
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	
	#userId = request.get_header(support.FieldDict['MODELID'], None)
	#if userId is None:
	#	return None
	#data = JSONEncoder().encode({ support.FieldDict['PAGE']: int(pg)})
	#print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_SubscribeSession.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	print msg
	token = msgMgr.send(msg)
	print token
	return token
'''
#endSession: end session for WebRTC channel
INPUT: userId, token type, room ID
OUTPUT: JSON object as follows:
format
{
	tokens if allowed to pub/sub. If not allowed error return
}
'''
@route('/model/room/session/end', method='POST')
def endSession():
	data = request.forms.items()[0]
	print data
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	
	#userId = request.get_header(support.FieldDict['MODELID'], None)
	#if userId is None:
	#	return None
	#data = JSONEncoder().encode({ support.FieldDict['PAGE']: int(pg)})
	#print data
	msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_EndSession.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	
	token = msgMgr.send(msg)
	print token
	return token

'''
#creditsadd: add new credit
INPUT: credits
OUTPUT: updated credit
format
{
	credits: updated credits
}
'''
@route('/user/credits', method=['POST', 'GET'])
def creditsadd():
	
	if request.method is 'POST':
		data = request.forms.items()[0]
	
	adid = request.get_header(support.FieldHeaderDict['ADID'], None)
	if adid is None:
		return None
	if request.method is 'POST':
		msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_Credits.value - 1, support.FieldDict['ADID']:adid, support.FieldDict['DATA']: data})
	else:
		msg = JSONEncoder().encode({support.FieldDict['APIMETHOD']:support.ApiMethods1.Api_Credits.value - 1, support.FieldDict['ADID']:adid})
	print msg
	token = msgMgr.send(msg)
	print token
	return token

@route('/<path:path>')
def pathurl(path):
	#return path
	print path
	return static_file(path, root="/cygdrive/c/projects/revideo/software/mobile/platforms/Oculora/platforms/android/assets/www/")


@route('/index2')
def index2():
	return static_file("index2.html", root=".")

if __name__ == "__main__":
    run(host='0.0.0.0', server='gevent')

