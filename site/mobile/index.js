var linkBase = "http://domain.com:8080/link/";

document.ontouchmove = function(e) {e.preventDefault()};

(function (window, undefined) {
    var kakao = {};
    window.kakao = window.kakao || kakao;

    var uagent = navigator.userAgent.toLocaleLowerCase();
    if (uagent.search("android") > -1) {
        kakao.os = "android";
        if (uagent.search("chrome") > -1) {
            kakao.browser = "android+chrome";
        }
    } else if (uagent.search("iphone") > -1 || uagent.search("ipod") > -1 || uagent.search("ipad") > -1) {
        kakao.os = "ios";
    }

    var app = {
        talk: {
            base_url: "kakaolink://sendurl?",
            apiver: "2.0.1",
            store: {
                android: "market://details?id=com.kakao.talk",
                ios: "http://itunes.apple.com/app/id362057947"
            },
            package: "com.kakao.talk"
        },
        story: {
            base_url: "storylink://posting?",
            apiver: "1.0",
            store: {
                android: "market://details?id=com.kakao.story",
                ios: "http://itunes.apple.com/app/id486244601"
            },
            package: "com.kakao.story"
        }
    };

    kakao.link = function (name) {
        var link_app = app[name];
        if (!link_app) return { send: function () {
            throw "No App exists";
        }};
        return {
            send: function (params) {
                var _app = this.app;
                params['apiver'] = _app.apiver;
                var full_url = _app.base_url + serialized(params);

                var install_block = (function (os) {
                    return function () {
                        window.location = _app.store[os];
                    };
                })(this.os);

                if (this.os == "ios") {
                    var timer = setTimeout(install_block, 2 * 1000);
                    window.addEventListener('pagehide', clearTimer(timer));
                    window.location = full_url;
                } else if (this.os == "android") {
                    if (this.browser == "android+chrome") {
                        window.location = "intent:" + full_url + "#Intent;package=" + _app.package + ";end;";
                    } else {
                        var iframe = document.createElement('iframe');
                        iframe.style.visibility = 'hidden';
                        iframe.src = full_url;
                        iframe.onload = install_block;
                        document.body.appendChild(iframe);
                    }
                }
            },
            app: link_app,
            os: kakao.os,
            browser: kakao.browser
        };

        function serialized(params) {
            var stripped = [];
            for (var k in params) {
                if (params.hasOwnProperty(k)) {
                    stripped.push(k + "=" + encodeURIComponent(params[k]));
                }
            }
            return stripped.join("&");
        }

        function clearTimer(timer) {
            return function () {
                clearTimeout(timer);
                window.removeEventListener('pagehide', arguments.callee);
            };
        }
    };
}(window));


function inviteKatalk(){
	$.get('/createGame',function(data){
		gamelink = linkBase + data.gameroom.id;
		kakao.link("talk").send({
	        msg : "우리 숫자야구 게임해요! \n아래 링크를 누르면 게임이 시작됩니다. \n(초대자도 아래 링크로 접속해서 게임을 시작하세요.)",
	        url : gamelink,
	        appid : "baseball.thefermata.net",
	        appver : "2.0",
	        appname : "숫자야구 온라인",
	        type : "link"
	    });
	});
}

function inviteLink(){
	$.get('/createGame',function(data){
		gamelink = linkBase + data.gameroom.id;
		$("#gameLinkP").html(gamelink);
		$("#inviteLinkview").show('fast');
	});
}

function inviteClose(){
	$("#inviteLinkview").hide('fast');
}