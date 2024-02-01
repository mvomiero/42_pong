What's happening

1. Django formulates a websocket request

var connectionString =
  "wss://" + window.location.host + "/ws/play/" + roomCode + "/" + char_choice + "/";
gameSocket = new WebSocket(connectionString);

2. The browser reports

WebSocket connection to 'wss://127.0.0.1:4443/ws/play/match/test/' failed: 

3. Nginx reports

Not Found: /ws/play/match/test/

4. Nginx access log reports

/var/log/nginx/access.log reports:

172.22.0.1 - - [31/Jan/2024:12:58:23 +0000] "GET /ws/play/match/a/ HTTP/1.1" 404 4479 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

Next steps

https://www.nginx.com/blog/websocket-nginx/

# 1. Drop back to nginx non-secure config to see if that works

no joy. i tried setting up nginx on port 8100 and forwarding to django on 8000 (wss:// changed back to ws:/ in main.js and hardcoded to 127.0.0.1:8100 so that it goes first to nginx)

i tried a separate location for /ws and just one location as described here: https://www.nginx.com/blog/websocket-nginx/

The endpoint can still not be found, in the same way as before. This suggests issues on the django side.

# 2. Research more about
