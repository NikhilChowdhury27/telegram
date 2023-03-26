export const ytPlayer =
    '<!DOCTYPE html>\n' +
    '    <html>\n' +
    '        <style type="text/css">\n' +
    '            html, body {\n' +
    '                height: 100%;\n' +
    '                width: 100%;\n' +
    '                margin: 0;\n' +
    '                padding: 0;\n' +
    '                background-color: #000000;\n' +
    '                overflow: hidden;\n' +
    '                position: fixed;\n' +
    '            }\n' +
    '        </style>\n' +
    '    \n' +
    '        <head>\n' +
    '            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n' +
    '            <script src="https://www.youtube.com/iframe_api"></script>\n' +
    '        </head>\n' +
    '    \n' +
    '        <body>\n' +
    '            <div id="youTubePlayerDOM"></div>\n' +
    '        </body>\n' +
    '    \n' +
    '        <script type="text/javascript">\n' +
    '            \n' +
    '            var UNSTARTED = "UNSTARTED";\n' +
    '            var ENDED = "ENDED";\n' +
    '            var PLAYING = "PLAYING";\n' +
    '            var PAUSED = "PAUSED";\n' +
    '            var BUFFERING = "BUFFERING";\n' +
    '            var CUED = "CUED";\n' +
    '            \n' +
    '            var YouTubePlayerBridge = window.YouTubePlayerBridge;\n' +
    '        \tvar player;\n' +
    '    \n' +
    '            var timerId;\n' +
    '    \n' +
    '        \tfunction onYouTubeIframeAPIReady() {\n' +
    '    \n' +
    '                YouTubePlayerBridge.sendYouTubeIFrameAPIReady();\n' +
    '                \n' +
    "        \t\tplayer = new YT.Player('youTubePlayerDOM', {\n" +
    '        \t\t\t\n' +
    "                    height: '100%',\n" +
    "        \t\t\twidth: '100%',\n" +
    '        \t\t\t\n' +
    '                    events: {\n' +
    '        \t\t\t\tonReady: function(event) { YouTubePlayerBridge.sendReady() },\n' +
    '        \t\t\t\tonStateChange: function(event) { sendPlayerStateChange(event.data) },\n' +
    '        \t\t\t\tonPlaybackQualityChange: function(event) { YouTubePlayerBridge.sendPlaybackQualityChange(event.data) },\n' +
    '        \t\t\t\tonPlaybackRateChange: function(event) { YouTubePlayerBridge.sendPlaybackRateChange(event.data) },\n' +
    '        \t\t\t\tonError: function(error) { YouTubePlayerBridge.sendError(error.data) },\n' +
    '        \t\t\t\tonApiChange: function(event) { YouTubePlayerBridge.sendApiChange() }\n' +
    '        \t\t\t},\n' +
    '    \n' +
    '        \t\t\tplayerVars: {"autoplay":0,"controls":0,"enablejsapi":1,"fs":0,"origin":"https:\\/\\/www.youtube.com","rel":0,"showinfo":0,"iv_load_policy":3,"modestbranding":1,"cc_load_policy":0}\n' +
    '                    \n' +
    '        \t\t});\n' +
    '        \t}\n' +
    '    \n' +
    '        \tfunction sendPlayerStateChange(playerState) {\n' +
    '                clearTimeout(timerId);\n' +
    '    \n' +
    '                switch (playerState) {\n' +
    '                \tcase YT.PlayerState.UNSTARTED:\n' +
    '                        sendStateChange(UNSTARTED);\n' +
    '                        return;\n' +
    '    \n' +
    '                \tcase YT.PlayerState.ENDED:\n' +
    '                        sendStateChange(ENDED);\n' +
    '                        return;\n' +
    '    \n' +
    '                    case YT.PlayerState.PLAYING:\n' +
    '                        sendStateChange(PLAYING);\n' +
    '                        \n' +
    '                        startSendCurrentTimeInterval();\n' +
    '                        sendVideoData(player);\n' +
    '                        return;\n' +
    '    \n' +
    '                    case YT.PlayerState.PAUSED:\n' +
    '                        sendStateChange(PAUSED);\n' +
    '                        return;\n' +
    '    \n' +
    '                    case YT.PlayerState.BUFFERING:\n' +
    '                        sendStateChange(BUFFERING);\n' +
    '                        return;\n' +
    '    \n' +
    '                    case YT.PlayerState.CUED:\n' +
    '                        sendStateChange(CUED);\n' +
    '                        return;\n' +
    '                }\n' +
    '    \n' +
    '                function sendVideoData(player) {\n' +
    '                    var videoDuration = player.getDuration();\n' +
    '    \n' +
    '                    YouTubePlayerBridge.sendVideoDuration(videoDuration);\n' +
    '                }\n' +
    '    \n' +
    '                function sendStateChange(newState) {\n' +
    '                    YouTubePlayerBridge.sendStateChange(newState)\n' +
    '                }\n' +
    '    \n' +
    '                function startSendCurrentTimeInterval() {\n' +
    '                    timerId = setInterval(function() {\n' +
    '                        YouTubePlayerBridge.sendVideoCurrentTime( player.getCurrentTime() )\n' +
    '                        YouTubePlayerBridge.sendVideoLoadedFraction( player.getVideoLoadedFraction() )\n' +
    '                    }, 100 );\n' +
    '                }\n' +
    '            }\n' +
    '    \n' +
    '            // JAVA to WEB functions\n' +
    '    \n' +
    '            function seekTo(startSeconds) {        \t\n' +
    '            \tplayer.seekTo(startSeconds, true);\n' +
    '            }\n' +
    '    \n' +
    '            function pauseVideo() {\n' +
    '            \tplayer.pauseVideo();\n' +
    '            }\n' +
    '    \n' +
    '            function playVideo() {\n' +
    '            \tplayer.playVideo();\n' +
    '            }\n' +
    '    \n' +
    '            function loadVideo(videoId, startSeconds) {\n' +
    '                player.loadVideoById(videoId, startSeconds);\n' +
    '                YouTubePlayerBridge.sendVideoId(videoId);\n' +
    '            }\n' +
    '    \n' +
    ' function cueVideo(videoId, startSeconds) {\n' +
    '            player.cueVideoById(videoId, startSeconds);\n' +
    '            YouTubePlayerBridge.sendVideoId(videoId);\n' +
    '        }\n' +
    '\n' +
    '        function setVolume(volumePercent) {\n' +
    '            player.setVolume(volumePercent);\n' +
    '        }\n' +
    '\n' +
    '        function setPlaybackRate(suggestedRate) {\n' +
    '            player.setPlaybackRate(suggestedRate);\n' +
    '            YouTubePlayerBridge.setPlaybackRate(videoId);\n' +
    '        }\n' +
    '\n' +
    '         function removeMoreVideos() {\n' +
    '\n' +
    '                var iFrameContainer = document.getElementById("youTubePlayerDOM");\n' +
    '                if(iFrameContainer)\n' +
    '                   {\n' +
    "                       var pauseOverlays = iFrameContainer.contentWindow.document.getElementsByClassName('ytp-pause-overlay');\n" +
    '                      if(pauseOverlays && pauseOverlays.length)\n' +
    '                       {\n' +
    '                         //remove suggestions overlay\n' +
    '                          pauseOverlays[0].style.display = "none";\n' +
    '                        }\n' +
    '                         //remove watch later and info\n' +
    "                        var topButtons = iFrameContainer.contentWindow.document.getElementsByClassName('ytp-chrome-top-buttons')\n" +
    '                        if(topButtons && topButtons.length)\n' +
    '                        {\n' +
    "                           topButtons[0].style.display = 'none';\n" +
    '                        }\n' +
    '\n' +
    '                        //remove youtube logo\n' +
    "                        var ytButton = iFrameContainer.contentWindow.document.getElementsByClassName('ytp-watermark yt-uix-sessionlink')\n" +
    '                        if(ytButton && ytButton.length)\n' +
    '                        {\n' +
    "                           ytButton[0].style.display = 'none';\n" +
    '                        }\n' +
    '\n' +
    '                    }\n' +
    '            }\n' +
    '\n' +
    '\n' +
    '    </script>\n' +
    '</html>\n';
