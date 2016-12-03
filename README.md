API   
---   
GET / return all torrents   
POST /torrent add torrent
    - Base46 buffer in html request content
    - Or multipart file (name file) 
POST /url add magnet torrent   
GET /{hash} get torrent informations   
POST /{hash}/pause pause torrent   
POST /{hash}/start start torrent   
POST /{hash}/ratio/{ratio} set torrent ratio   
DELETE /{hash} remove torrent
   
DOCKER   
------   