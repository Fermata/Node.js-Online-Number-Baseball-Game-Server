exports.data = {
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
	resourceBase : "resource",			//파비콘등 브라우저가 요청하는 자료들 (리소스)
	onNullParam : "mainpage.htm"		//도메인 루트로 접근하는 경우 반환할 파일 (정적파일디렉토리 루트 기준)
}
