var firstrun = true;
var usherClient = {
	userId : "",
	userToken : "",
	gameId : "",
	gameToken : "",
	gameType : "classic",
	taskType : ""
};

var usherAction = {
	"request" : function (target, data,callback){
		$.extend(data,usherClient); 
		usherClient.taskType = "";
		$.post("/"+target,data,callback, "json");
	}
};

function usherCallback(data){
	console.log(data);
	switch(data.action){
		case "CREATED":
			usherMessage("서버에 접속되었습니다.");
			firstrun = false;
			usherClient.userId = data.id;
			usherClient.userToken = data.token;
			usherClient.gameId = (location.href.split("/link/"))[1];
			usherAction.request("joinGame",{},function(rdata){
				usherMessage("게임에 접속되었습니다.");
				usherMessage("상대방의 응답을 기다리는 중...");
				usherClient.gameToken = rdata.gameToken;
			});
			break;
		case "GET_READY":
			usherSendEnable();
			usherMessage(data.message);
			usherClient.taskType = "numberset";
			break;
	}
}

function usherSendEnable(){

}

function usherSend(){
	switch(usherClient.taskType){
		case "numberset":
			var numarray = document.getElementById("numberInput").value.split("");
			var dataToSend = {"valueA":numarray[0],"valueB":numarray[1],"valueC":numarray[2],"valueD":numarray[3]};
			usherAction.request("doGame",dataToSend,function(rdata){
				console.log(rdata);
				usherMessage(rdata.message);
			});
			break;
		case "hit":
			break;
	}
}

function usherMessage(data){
	$("#messages").html("<p>" + data + "</p>" + $("#messages").html());
}