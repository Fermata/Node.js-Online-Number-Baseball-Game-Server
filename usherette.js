/*	usherette.js
	웹기반 숫자야구게임 서버 (Node.js)
	2013.11.5 화요일 이해찬
	http://thefermata.net
	soport55@thefermata.net     */

var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");
var queryString = require("querystring");

var usherSettings = {
	debugLevel : 0,						//디버깅 레벨. 중요도 n 이상의 메세지만 보이도록 설정
	debugTime : true,					//디버깅 메세지에 시간을 기록하는가?
	serverListenPort : 8080,			//서버 포트
	hostingParam : "static",			//정적자료 요청시 사용할 인자
	mime : {							//데이터 mime
		"htm" : "text/html",
		"html" : "text/html",
		"js" : "text/javascript",
		"json" : "text/json",
		"css" : "text/css",
		"text" : "text/plain",
		"jpg" : "image/jpeg",
		"png" : "image/png",
		"gif" : "image/gif",
		"ico" : "image/x-icon"
	},
	defaultFile : "index.htm",			//정적자료를 디렉토리로 요청시 찾을 파일
	siteBase : "site",					//정적자료가 저장된 디렉토리
	resourceBase : "resource",			//파비콘등 리소스 저장할 곳
	onNullParam : "mobile/index.htm"		//도메인 루트로 접근하는 경우 반환할 파일 (정적파일디렉토리 루트 기준)
};

var usherErrors = {
	404 : "404 Not Found",
	debug : {
		0 : "전체",
		1 : "상황",
		2 : "진행",
		3 : "일반",
		4 : "중요",
		5 : "경고",
		6 : "보안"
	}
};

var usherSession = {
	users : {},
	games : {}
};

// 디버깅용

var usherette = {
	log : function (data, level, request){
		if(usherSettings.debugLevel <= level){
			console.log("--------------------------------------------------");
			if(usherSettings.debugTime){
				var dt = new Date();
				var d = dt.toLocaleDateString();
				console.log("[LEVEL " + level + ":" + usherErrors.debug[level] + "]", dt);
			}
			if(request){
				console.log("IP: " + usherWorks.remoteAddress(request) + " 요청: " + request.url);
			}
			console.log(data);
		}
	}
}

// 간단한 유틸들 나중에 따로 빼야징...

var jUtils = {
	fourString : function(){
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	},
	guid : function(){
		return this.fourString() + this.fourString() + "-" + this.fourString() + '-' + this.fourString() + '-' + this.fourString() + '-' + this.fourString() + this.fourString() + this.fourString();
	}
};

// 리스폰스에 제이슨 헤더랑 스트링값 바로 뽑아주는 함수

function usheretteJSON(response, data){
	var toWrite= JSON.stringify(data);
	response.writeHead(200, {
		"Content-Type":"text/json; charset=utf-8",
		"Content-Length":toWrite.length
	});
	response.write(toWrite);
	response.end();
}

function usherWRTJ(data){
	return "이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠. 이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠. 이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠. 이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠. 이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠. 이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠. 이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠.사실 적당한 글자수의 문장을 반복문 돌려서 주루룩 쓰면 될 것 같지만 그게 너무 귀찮습니다. 그냥 일단 길쭉길쭉한 별 무의미한 문장을 보내려고합니다. 아 치킨먹고싶다. 역시 치킨은 생명의 양식입니다. 치렐루야. 아 이거 얼마나 써야되는거지 이제 1키로바이트 되지 않았나. 아 진짜 아 못하겠다. 이정도면 렌더링 하겠지. 아 해야지. 혹시 이거 읽은 사람이 있다면 치킨좀 사주세요.<script type='text/javascript'>parent.usherCallback(" + JSON.stringify(data) + ");</script>";
}

function usherWrite(userId,data){
	usherSession.users[userId].response.write(usherWRTJ(data));
}

function usherUserTokenValidate(userId,userToken){
	return (usherSession.users[userId].token == userToken);
}

function usherGameTokenValidate(userId,userToken){
	return (usherSession.games[userId].token == userToken);
}

function usherPostRequest(request,response,callback){
	var body = "";
	request.on("data", function(data){
		body += data;
	});
	request.on("end", function(){
		var postData = queryString.parse(body);
		callback(postData);
	});
}

// 게임관련 함수들

var gameWorks = {
	newNumbers : function(){
		var array[4], i,j;
		for(i=0; i<array.length; i++){
			array[i] = Math.floor(Math.random()*10);
			for(j=0; j<i; j++){
				if(array[i] == array[j]){
					i--;
					break;
				}
			}
		}
		return array;
	},

	hitCalc : function(real,hits){
		var balls = 0, strikes = 0, i,j;
		for(i=0; i<real.length; i++){
			for(j=0; j<real.length; j++){
				if(real[i] == hits[j]){
					if(i==j){
						strikes++;
					}else{
						balls++;
					}
				}
			}
		}
		return {"ball":balls,"strike":strikes};
	}
}

// 액션 지정

var usherActions =  {
	session : function(request,response){	//게임 상황이나 서버 구동상황을 실시간으로 사용자에게 전달해줄 응답 (푸시?)
		var userId = jUtils.guid();
		var userToken = jUtils.guid();
		var createdTime = new Date().getTime();
		var user = {"created" : createdTime, "response" : response, "token":userToken, "write" : response.write};
		usherette.log("새로운 실시간 세션 생성:" + userId + "\n토큰: " + userToken, 5, request);
		request.on("end",function(){
			// 응답이 끊어진 경우

		});
		usherSession.users[userId] = user;
		usherSession.users[userId].response.writeHead(200, {
			'Content-Type' : 'text/html; charset=utf-8',
			'Transfer-Encoding' : 'chunked'
		});
		var dataInReturn = {"action":"CREATED","id":userId,"token":userToken};
		response.write("<html><head><meta charset='utf-8'></head><body>이건 좀 쓸데없는데이터를 미리보냅니다. 그래야 좀 몇몇 맘에 안드는 브라우저들이 렌더링을 하거든요. 1키로바이트정도 미리 보내야 렌더링을 시작한다는데 대체 그게 얼마나 많은 데이터를 필요로 하는건지 알 수가 있어야죠. 사실 적당한 글자수의 문장을 반복문 돌려서 주루룩 쓰면 될 것 같지만 그게 너무 귀찮습니다. 그냥 일단 길쭉길쭉한 별 무의미한 문장을 보내려고합니다. 아 치킨먹고싶다. 역시 치킨은 생명의 양식입니다. 치렐루야. 아 이거 얼마나 써야되는거지 이제 1키로바이트 되지 않았나. 아 진짜 아 못하겠다. 이정도면 렌더링 하겠지. 아 해야지. 혹시 이거 읽은 사람이 있다면 치킨좀 사주세요.");
		usherWrite(userId, dataInReturn);
	},

	messageToUser : function(request, response){	// 클라이언트간 바로 메세지 전달용. 보안상 문제있을듯.
		var params = request.url.split("/");
		var userId = params[2];
		var message = params[3];
		usherette.log(userId + " 에 메세지 전달", 4, request);
		var dataInReturn = {"action":"MESSAGE_ARRIVED","message":message};
		usherWrite(userId, dataInReturn);
		var output = {"action":"SENT"};
		usheretteJSON(response, output);
	},

	createGame : function(request, response){
		usherPostRequest(request, response, function(postData){
			var gameId = jUtils.guid();		// 게임 고유아이디
			var gameToken = jUtils.guid();
			var gameType = postData.gameType;	// 게임 종류
			var gameOptions = postData.gameOptions;	// 게임 옵션
			var gameroomObject = {
				"id" : gameId,
				"token" : gameToken,
				"type" : gameType,
				"options" : gameOptions,
				"state" : "waiting",
				"gameData" : {},
				"players" : []
			};
			usherSession.games[gameId] = gameroomObject;
			usherette.log("게임 '" + gameToken + "'이 생성됨", 4, request);
			usheretteJSON(response, {
				"action":"GAME_CREATED",
				"gameroom":gameroomObject
			});
		});
	},

	joinGame : function(request, response){
		usherPostRequest(request, response, function(postData){
			var attenderId = postData.userId;	//참가자 아이디
			var attenderToken = postData.userToken;
			if(usherUserTokenValidate(attenderId,attenderToken)){
				var targetGame = postData.gameId; // 접속할 게임
				if(usherSession.games[targetGame] && usherSession.games[targetGame].state != "end" && usherSession.games[targetGame].players.length < 2){
					var targetToken = usherSession.games[targetGame].token;
					var targetGameType = usherSession.games[targetGame].type;
					var playerObject = [{"id":attenderId,"score":0, "count":0}];
					usherSession.games[targetGame].players.push(playerObject);
					usherette.log("게임 '" + targetGame + "'에 접속함", 4, request);
					usheretteJSON(response,{
						"action" : "JOINED_GAME",
						"gameId" : targetGame,
						"gameToken" : targetToken,
						"gameType" : targetGameType
					});
					if(usherSession.games[targetGame].players.length == 2){
						usherette.log("게임작업: 클래식 게임 준비. 각자 숫자를 지정하세요.",1,request);
						usherSession.games[targetGame].state = "playing";
						usherSession.games[targetGame].players.forEach(function(gamerObject){
							usherWrite(gamerObject[0].id,{
								"action" : "GET_READY",
								"gameId" : targetGame,
								"message" : "플레이어가 모두 접속했습니다. 각자 4자리 숫자를 선택해주세요."
							});
						});
					}
				}else{
					usherette.log("게임 '" + targetGame + "' 접속 실패", 5, request);
					usheretteJSON(response, {
						"action":"FAIL",
						"message":"[오류:5] 이미 종료된 게임이거나, 게임을 찾을 수 없습니다."
					});	
				}
			}else{
				usherette.log("토큰과 아이디 일치하지 않음!", 6, request);
				usheretteJSON(response, {
					"action":"FAIL",
					"message":"[오류:4] 유효하지 않은 접속"
				});
			}
		});
	},

	doGame : function(request, response){
		usherPostRequest(request, response, function(postData){
			var playerId = postData.userId;
			var playerToken = postData.userToken;
			var gameId = postData.gameId;
			var gameToken = postData.gameToken;
			var taskType = postData.taskType;
			var queryValues = postData.queryValues;
			if(usherUserTokenValidate(playerId,playerToken) && usherGameTokenValidate(gameId,gameToken)){
				var gameType = usherSession.games[gameId].type;
				var gameOptions = usherSession.games[gameId].options;
				var players = usherSession.games[gameId].players;
				switch(taskType){
					case "numberset":
						var me,opponent;
						if(usherSession.games[gameId].players[0][0].id == playerId){
							me = 0;
							opponent = 1;
						}else{
							me = 1;
							opponent = 0;
						}
						var getNumber = [postData.valueA,postData.valueB,postData.valueC,postData.valueD];
						var msgToUser = "숫자가 저장되었습니다. [" + postData.valueA + postData.valueB + postData.valueC + postData.valueD + "] 입니다.";
						usherWrite(playerId,{
							"action" : "NUMBER_SET",
							"message" : msgToUser
						});
						usherSession.games[gameId].players[me][0].numbers = getNumber;
						usherette.log("게임작업: 숫자를 지정했습니다. [" + postData.valueA + postData.valueB + postData.valueC + postData.valueD + "]",1,request);
						if(usherSession.games[gameId].players[opponent][0].numbers != undefined){
							usherSession.games[gameId].players.forEach(function(gamerObject){
								usherWrite(gamerObject[0].id,{
									"action" : "START_GAME",
									"message" : "두명 모두 숫자를 선택했습니다. 게임이 시작되었습니다."
								});
							});
						}
						response.end();
						break;
					case "hit":
						var opponent;
						if(usherSession.games[gameId].players[0][0].id == playerId){
							opponent = 1;
						}else{
							opponent = 0;
						}
						var getNumber = [postData.valueA,postData.valueB,postData.valueC,postData.valueD];
						var calcResult = gameWorks.hitCalc(usherSession.games[gameId].players[opponent][0].numbers,getNumber);
						if(calcResult.strike == 4){
							usherette.log(playerId + "가 숫자를 맞춤", 1, request);
							usherSession.games[gameId].players.forEach(function(gamerObject){
								gamerObject.count++;
								var resultMessage = "가 이겼습니다. 게임이 끝났습니다."; 
								usherWrite(gamerObject[0].id,{
									"action" : "GAME_OVER",
									"playerId" : playerId,
									"message" : resultMessage
								});
							});
							delete usherSession.games[gameId];
							response.end();
						}else{
							usherette.log(playerId + "는 " + calcResult.ball + "볼 " + calcResult.strike + "스트라이크", 1, request);
							usherSession.games[gameId].players.forEach(function(gamerObject){
								gamerObject.count++;
								var resultMessage = "가 [" + postData.valueA + postData.valueB + postData.valueC + postData.valueD + "]로 " + calcResult.ball + "볼 " + calcResult.strike + "스트라이크를 쳤습니다."; 
								usherWrite(gamerObject[0].id,{
									"action" : "PLAYER_HIT_RESULT",
									"gameId" : gameId,
									"turn" : usherSession.games[gameId].players[opponent][0].id,
									"playerId" : playerId,
									"message" : resultMessage
								});
							});
							response.end();
						}
						break;
				}
			}else{
				usherette.log("토큰과 아이디 일치하지 않음!", 6, request);
				usheretteJSON(response, {
					"action":"FAIL",
					"message":"[오류:4] 유효하지 않은 접속"
				});
			}
		});
	},

	endGame : function(request, response){
		usherPostRequest(request, response, function(postData){
			if(usherGameTokenValidate(postData.gameId,postData.gameToken)){
				usherSession.games[gameId].players.forEach(function(gamerObject){
					gamerObject.score = 0;
					gamerObject.count = 0;
					usherWrite(gamerObject[0].id,{
						"action" : "QUIT",
						"message" : "상대방이 게임을 나갔습니다."
					});
				});
				delete usherSession.games[gameId];
			}
		});
	},

	link : function(request, response){
		usherette.log("게임 참가 시도", 4, request);
		var fileToLoad = usherWorks.loadFromHostingDir("mobile/game.htm");
		usherWorks.webResponseStream(fileToLoad,response,request);
	}
}

var usherServer = {
	messageUser : function(user,message){	// 서버에서 사용자에게 메세지 전달.
		usherette.log(userId + " 에 메세지 전달", 4);
		var dataInReturn = {"action":"SERVER_MESSAGE","message":message};
		usherWrite(user, dataInReturn);
	},

	clearSession : function(user){
		delete usherSession.users[user];
		usherette.log(user + " 세션이 삭제됨", 4);
	}
}

// 반복되는 코드들 한번에 고칠 수 있게 묶어두자.

usherWorks = {
	mimeOfFile : function(url){
		var extension = this.extensionOfURL(url);
		if(usherSettings.mime[extension] == undefined){
			return "application/octet-stream";
		}else{
			return usherSettings.mime[extension];
		}
	},

	extensionOfURL : function(url){
		var positionOfDot = url.indexOf(".");
		var positionOfEnd= url.indexOf("?");
		if(positionOfEnd == -1){
			positionOfEnd = url.length;
		}else{
			positionOfEnd--;
		}
		return url.substr(positionOfDot+1,positionOfEnd-positionOfDot);
	},

	defaultFile : function(dir){
		var target = path.join(dir,usherSettings.defaultFile);
		return target;
	},

	loadFileDir : function(url){
		if(path.basename(url) == ""){
			return path.join(url,usherSettings.defaultFile);
		}else{
			return url;
		}
	},

	refinedURLAsDir : function(url){
		var dirs = (url.split("?"))[0];
		if(fs.existsSync(dirs)){
			if(fs.lstatSync(dirs).isDirectory()){
				return usherWorks.defaultFile(dirs);
			}else{
				return dirs;
			}
		}else{
			return dirs;
		}
	},

	webResponseStream : function(fileToLoad,response,request){
		var fileToLoadDir = usherWorks.refinedURLAsDir(fileToLoad);
		fs.stat(fileToLoadDir, function(error, data){
			var pipeLine;
			if(error){
				var toWrite = usherErrors[404];
				response.writeHead(404, {
					"Content-Type":"text/html",
					"Content-Length":toWrite.length
				});
				response.write(toWrite);
				response.end();
				usherette.log(fileToLoadDir + " 를 찾지 못해 404 오류 반환", 3, request);
			}else{
				var fileMime = usherWorks.mimeOfFile(fileToLoadDir);
				response.writeHead(200, {
      				'Content-Type' : fileMime,
    			});
    			var pipeLine = fs.createReadStream(fileToLoadDir);
  				pipeLine.pipe(response).on("end", function(){
  					response.end();
  				});
  				usherette.log(fileToLoadDir + " 파일 데이터를 " + fileMime + " 로 파이프 응답 완료", 3, request);
  			}
  		});
	},

	loadFromHostingDir : function(target){
		return path.join(usherSettings.siteBase, target);
	},

	loadFromResourceDir : function(target){
		return path.join(usherSettings.resourceBase, target);
	},

	remoteAddress : function(request){
		return request.connection.remoteAddress;
	}
}

usherette.log("HTTP 서버 생성 시도 중",0);
http.createServer(function(request,response){
	usherette.log("새로운 요청 응답 시작", 1, request);
	var urlParse = request.url.split("/");
	var usher = new Object();
	var usherRealParams = "";
	for(var index = 2; index < urlParse.length; index++){
		usherRealParams += "/" + urlParse[index];
	}
	usher.request = {
		type : urlParse[1],
		parameter : urlParse
	};
	switch(usher.request.type){
		case "":
			usherette.log("정적 파일 루트", 2, request);
			usherWorks.webResponseStream(usherWorks.loadFromHostingDir(usherSettings.onNullParam),response,request);
			break;
		case "favicon.ico":
			usherette.log("파비콘이 요청됨", 0, request);
			usherWorks.webResponseStream(usherWorks.loadFromResourceDir("favicon.ico"),response,request);
			break;
		case usherSettings.hostingParam:
			usherette.log("정적 데이터 요청", 2, request);
			var fileToLoad = usherWorks.loadFileDir(usherSettings.siteBase + usherRealParams);
			usherWorks.webResponseStream(fileToLoad,response,request);
			break;
		default:
			if(usherActions[usher.request.type]){
				usherette.log("액션 '" + usher.request.type + "'을 찾음" , 4, request, usherette);
				usherActions[usher.request.type](request,response);
			}else{
				usherette.log("알 수 없는 요청 '" + usher.request.type + "'" , 4, request);
				var toWrite = "Usher request type '" + usher.request.type + "' is not defined.";
				response.writeHead(404, {
					"Content-Type":"text/html",
					"Content-Length":toWrite.length
				});
				response.write(toWrite);
				response.end();
			}
			break;
	}
}).listen(usherSettings.serverListenPort);
usherette.log(usherSettings.serverListenPort + " 포트로 HTTP 요청 받는 중",0);
