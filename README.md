API   
---   
GET / return all torrents   
POST /torrent add torrent   
    - Base46 buffer in html request content ( use content-type text/plain )   
    - Or multipart file (name torrent)   
POST /url add magnet torrent   
    - post json { url: "magnet||http" }
GET /{hash} get torrent informations   
POST /{hash}/pause pause torrent   
POST /{hash}/start start torrent   
POST /{hash}/ratio/{ratio} set torrent ratio   
DELETE /{hash} remove torrent
   
DOCKER   
------   