var firstrun = true;
var usherClient = {
	userId : "",
	userToken : "",
	gameId : "",
	gameToken : "",
	gameType : "classic",
	taskType : ""
};
var sendEnabled = false;

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
			sendEnabled = true;
			usherMessage(data.message);
			usherClient.taskType = "numberset";
			break;
		case "NUMBER_SET":
			usherMessage(data.message);
			break;
		case "START_GAME":
			sendEnabled = true;
			usherClient.taskType = "hit";
			usherMessage(data.message);
			break;
		case "PLAYER_HIT_RESULT":
			sendEnabled = true;
			usherClient.taskType = "hit";
			usherMessage(usherStringWithId(data.playerId) + data.message);
			break;
		case "GAME_OVER":
			usherMessage(usherStringWithId(data.playerId) + data.message);
			usherClient.taskType = "";
			sendEnabled = false;
			break;
	}
}

function usherStringWithId(data){
	if(data == usherClient.userId){
		return "내";
	}else{
		return "상대";
	}
}


function usherSend(){
	if(sendEnabled){
		var numarray = document.getElementById("numberInput").value.split("");
		var dataToSend = {"valueA":numarray[0],"valueB":numarray[1],"valueC":numarray[2],"valueD":numarray[3]};
		var checker = numarray;
		checker.sort();
		var last = checker[0];
		var option = true;
		for (var i=1; i<checker.length; i++) {
			if (checker[i] == last){
				option = false;
				break;
			}
		}
		if(option){
		switch(usherClient.taskType){
				case "numberset":
					usherAction.request("doGame",dataToSend);
					break;
				case "hit":
					usherAction.request("doGame",dataToSend);
					break;
			}
			sendEnabled = false;
			document.getElementById("numberInput").value = "";
		}else{
			alert("나같으면 이런 숫자는 안쓴다.");
		}
	}
}

function usherMessage(data){
	$("#messages").html("<p>" + data + "</p>" + $("#messages").html());
}