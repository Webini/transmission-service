Transmission service
====================

SERVER
------

To start server simply use
```
node server.js
```

Parameters available  :

| Name | Action |
| ---- | ------ |
| --run-with-migrations | It execute migrations then start the server |
| --migrate | It will only execute migrations |
| none | It will start the server without migrations scripts |
  
  
    
API   
---   

| Method | Path          | Description |  
| ------ | ------------- | ------------ |
| GET    | /             | return all torrents |   
| POST   | /torrent      | Add a new torrent <br> - Base46 buffer in html request content ( use content-type text/plain ) <br /> - Or multipart file (field name torrent) | 
| POST   | /url          | add magnet torrent<br > - post json ```{ "url": "magnet||http" }``` |
| GET    | /{hash}       | get torrent informations |   
| POST   | /{hash}/pause | pause torrent |
| POST   | /{hash}/start | start torrent |
| POST   | /{hash}/ratio/{ratio} | set torrent ratio |
| DELETE | /{hash}       | remove torrent |
   
   
   
DOCKER   
------   
You can build a docker image using the Dockerfile available in this repository.   
Environment variables available :

| Name                    | Default Value  | Description |
| ----------------------- | -------------- | ----------- |
| SERVER_PORT             | 8080           | Http server port |
| SERVER_HOST             | localhost      | Http server host |
| TRANSMISSION_HOST       | 127.0.0.1      | Transmission host address |
| TRANSMISSION_PORT       | 9091           | Transmission api port |
| TRANSMISSION_USER       | transmission   | Transmission api user |
| TRANSMISSION_PASSWORD   | transmission   | Transmission api password |
| TRANSMISSION_URL        |                | Transmission rpc url |
| TRANSMISSION_SYNC_DELAY | 500            | Transmission worker delay, it will by default update the data each 500ms |
| UPLOAD_PATH             | /var/tmp/transmission-uploads | Temp path for uploaded torrents |
| DATABASE_DIALECT        | sqlite         | Database dialect cf [sequelize dialec](http://docs.sequelizejs.com/en/1.7.0/docs/usage/#dialects), don't forget to fork & install your connector if you are'nt going to use sqlite |
| DATABASE                | transmission   | Database name |
| DATABASE_USER           |                | Database user |
| DATABASE_PASSWORD       |                | Database password |
| DATABASE_HOST           |                | Database host |
| DATABASE_LOGGING        | 0              | Database logging, it will output all queries |
| DATABASE_PORT           |                | Database port |
| DATABASE_STORAGE        | data/db.sqlite | Database storage ( used for sqlite ), use relative path starting from this project directory |
  
## Volumes
   
By default the dockerfile expose the database storage ( `/home/node/transmission-service/data` )  
  
## Ports
  
8080