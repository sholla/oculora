//var HOST_ADDRESS = "http://10.0.0.2:8080";
var OculoraURLs = { HostAddress: "http://ec2-52-8-81-196.us-west-1.compute.amazonaws.com:8080", Login : "/access/login", Profile: "/user/profile", ProfileImage: "/user/profile/image", ProfileRemove: "/user/profile/remove", ProfileRetrieve: "/user/profile/retrieve", Follower: "/model/room/follow", Room: "/model/room", RoomImage: "/model/room/image", RoomRemove: "/model/room/remove", RoomList: "/model/room/list", UserList: "/user/list", PubList: "/model/publish/candidates", ActiveSubList: "/model/subscribe/candidates/active", StartSession: "/model/room/session/start", SubscriberSession: "/model/room/session/subsession", EndSession: "/model/room/session/end", NotificationRegId: "/model/app/notification/regid", Credits: "/user/credits"};
//"http://ec2-52-8-81-196.us-west-1.compute.amazonaws.com:8080"
//"http://10.0.0.2:8080"
function AbsoluteOculoraURL(url) {
    return OculoraURLs.HostAddress + url;
}

var FieldNames = { adid: 'adid', notifyregid: "nrid", fullName: "fn", nickName: "nn", tags: "tags", image: "imageURL", profileimage: "imageFile", name: "rn", descr: "descr", images: "images", publishers: "pubs", searchMode: "sm", tagsfilter: "scm", mainId: "id", id: "mid", uid: "uid", enableRoom: "er", followtargetid: "fti", follow: "flw", followtype: "flt", create: "create", MainImageIdx:"mii", StreamType:"st", apiKey: "ak", RoomSessId: "otsid", RoomToken: "stt", DirectSessId: "sds", DirectToken: "sdt", FullView: "fv", SubscribeBrowse: "sb", SubInfo: "si", RoomAccessSub: "ras", RoomAccessPub: "rap", RoomImage: "ri", Credits: "cr", SessionInstance : "si" };
var QueryFields = {page: 'pg', sortOrder: 'sor', sortOn: 'so', sortData: 'sd'};

var Oculora_SearchMode = [0, 1, 2];
var Oculora_StreamType = {StreamType_Publish: 0, StreamType_Subscribe: 1};
var Oculora_InteractMode = {InteractType_Voice: 0, InteractType_Chat: 1};
var Oculora_SignalHandlerMark = "signal:";
var Oculora_SignalType = { SignalType_Subscriber: 'oculora_subscriber', SignalType_Select: 'oculora_select', SignalType_Message_Text: 'oculora_message_text', SignalType_Message_Image: 'oculora_message_image' };
var Oculora_SignalClass = [ "button-balanced", "button-assertive"];
var Oculora_PublishSelectTimeout = 1*60;
var Oculora_SubNewPubTimeout = 1*60;
var Oculora_SubPubGoneTimeout = 5*60;

var Oculora_RemoteUser = 0;
var Oculora_ThisUser = 1;

var Oculora_FollowType = {FollowType_UserTORoom: 0, FollowType_RoomTOUser: 1, FollowType_UserTOUser: 1};

var Oculora_NotificationSenderId = "912925588704";
var Oculora_RegId = "regid";

var Oculora_PageNumItems = 10;

var Oculora_DefaultImageSize = [50, 50];
var Oculora_Image_Width_Idx = 0;
var Oculora_Image_Height_Idx = 1;

function isEmpty(str) {
    return (!str || 0 === str.length);
}

var Oculora_PayDeploy = 2; //0 for deploy, 1 for test, 2 for no payment testing
var Oculora_OpentokDeploy = true; //true for deployed

//Payments/credits constants
var CREDITS_WARN_THRESHOLD = 1;
var CREDITS_MARK = 1; //60 credits = 1 hour of use! = $1
var CREDIT_PURCHASE_UNIT = 60;