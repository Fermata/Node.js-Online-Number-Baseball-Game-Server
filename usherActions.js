// function(request, response){}

var jUtils = {
	fourString : function(){
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	},
	guid : function(){
		return this.fourString() + this.fourString() + "-" + this.fourString() + '-' + this.fourString() + '-' + this.fourString() + '-' + this.fourString() + this.fourString() + this.fourString();
	}
};


function usheretteJSON(response, data){
	var toWrite= JSON.stringify(data);
	response.writeHead(200, {
		"Content-Type":"text/json",
		"Content-Length":toWrite.length
	});
	response.write(toWrite);
	response.end();
}

function usherWRTJ(data){
	return JSON.stringify(data);
}

exports.data = {
	realtime : function(request,response, usherette){
		var userId = jUtils.guid();
		var createdTime = new Date().getTime();
		var user = {"created" : createdTime, "response" : response, "write" : response.write};
		usherette.log("새로운 실시간 서버 생성:" + userId, 5, request);
		usherSession.users[userId] = user;
		usherSession.users[userId].response.writeHead(200, {
			'Content-Type' : 'text/json',
			'Transfer-Encoding' : 'chunked'
		});
		var dataInReturn = {"action":"CREATED","id":userId};
		usherSession.users[userId].write(dataInReturn);
	},
	createUser : function(request, response, usherette){
		usherette.log("새 게임 생성","");
		var output = {"calc" : "complete"}
	}
}