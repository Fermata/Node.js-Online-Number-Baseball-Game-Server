http = require("http");
fs = require("fs");

usherSettings = {
	serverListenPort : 8080,
	hostingParam : "home"
};


http.createServer(function(request,response){
	urlParse = request.url.split("/");
	usher = new Object();
	usherRealParams = "";
	for(var index = 1; index < urlParse.length; index++){
		usherRealParams += "/" + urlParse[index];
	}
	usher.request = {
		type : urlParse[1],
		parameter : urlParse
	};
	switch(usher.request.type){
		case "":
				fs.readFile("site/index.htm", "utf8", function (error,data) {
					if(error){
						response.writeHead(404, {"content-type":"text/html"});
						response.write("404 Not Found");
					}else{
						response.writeHead(200, {"content-type":"text/html"});
						response.write(data);
					}
					response.end();
				});
			break;
		case usherSettings.hostingParam:
				fs.readFile("site" + usherRealParams, "utf8", function (error,data) {
					if(error){
						response.writeHead(404, {"content-type":"text/html"});
						response.write("404 Not Found");
					}else{
						response.writeHead(200, {"content-type":"text/html"});
						response.write(data);
					}
					response.end();
				});
			break;
		default:
				response.writeHead(200, {"content-type":"text/html"});
				response.write("Usher request type '" + usher.request.type + "' is not defined.");
				response.end();
			break;
	}
}).listen(usherSettings.serverListenPort);