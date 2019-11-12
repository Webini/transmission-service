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
| --migrate | It will only execute migrations |
| none | It will start the server without migrations scripts |
  
  
    
API   
---   

| Method | Path          | Description |  
| ------ | ------------- | ------------ |
| GET    | /             | return all torrents |   
| POST   | /torrent      | Add a new torrent <br> - Base46 buffer in html request content ( use content-type text/plain ) <br /> - Or multipart file (field name torrent) | 
| POST   | /url          | add magnet torrent<br > - post json `{ "url": "magnet||http" }` |
| GET    | /{hash}       | get torrent informations |   
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
| DOMAIN                  | null           | Add domain field in messages |
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
| DATABASE_STORAGE        | /home/node/data/transmission.sqlite | Database storage ( used for sqlite ), use relative path starting from this project directory |
| REDIS_PORT              |       6379     | Redis port |
| REDIS_HOST              |                | Redis host | 
| REDIS_PASSWORD          |                | Redis password | 
| TRANSMISSION_STORAGE_PATH | /data        | Transmission storage path (used by /storage endpoint for monitoring purpose) |
| HOST_ID                 |                | Host ID, you can provide anything here, it will be passed to events |
## Volumes
   
By default the dockerfile expose the database storage ( `/home/node/data` )  
If you are mounting this directory don't forget to set his uid & guid at 1000 since node application is not running as root.  

## Ports
  
8080


Redis   
--------  
If environment variable REDIS_HOST is set, this server will publish events to redis with bulljs.

## Event object
| Field    | Description                         |
| -------- | ----------------------------------- |
| date     | Event creation date                 |
| data     | Event data, see description below   |
| type     | Event type, same as routing key     |
| hostId   | Host ID provided in env variable    |
| objectId | ObjectId associated with this event |



## Routing key and events content associated 

| Queue name | Job type           | Data field | Description |
| ---------- | ------------------ | ---------- | ----------- | 
| file       | created       | Same structure as file model | Fired when a new file is created | 
| file       | updated       | `{ new: { File model }, old: { File model }, diff: { field => | value that differ from old model } }` | Fired when the file is updated |
| file       | deleted       | Same structure as file model | Fired when the file is deleted |
| file       | downloaded    | Same structure as file model | Fired when the file has finished | downloading |
| torrent    | created    | Same structure as torrent model | Fired when a new torrent is | created | 
| torrent    | updated    | `{ new: { torrent model }, old: { torrent model }, diff: { field | => value that differ from old model } }` | Fired when the torrent is updated |
| torrent    | deleted    | Same structure as torrent model | Fired when the torrent is deleted |
| torrent    | downloaded | Same structure as torrent model | Fired when the torrent has finished downloading |


