FROM node:10.15.3

ENV SERVER_PORT 8080
ENV SERVER_HOST 0.0.0.0
ENV UPLOAD_PATH /var/tmp/transmission-uploads
ENV DATABASE_STORAGE /home/node/data/transmission.sqlite
ENV DATABASE_DIALECT sqlite
ENV DATABASE_LOGGING 0
ENV DATABASE transmission
ENV TRANSMISSION_HOST transmission.host
ENV TRANSMISSION_PORT 9091
ENV TRANSMISSION_USER transmission
ENV TRANSMISSION_PASSWORD transmission
ENV RABBITMQ_EXCHANGE transmission-service
ENV LOG_LEVEL 'warn'

VOLUME [ "/home/node/data" ]

COPY --chown=node:node . "/home/node/transmission-service"

USER node
WORKDIR /home/node/transmission-service

RUN mkdir /var/tmp/transmission-uploads && \
    touch .env && \
    npm i 

EXPOSE 8080
CMD [ "node", "server.js", "--run-with-migrations" ]