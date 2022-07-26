FROM node:16-alpine
ADD . /appDir
WORKDIR /appDir
RUN ["npm", "install"]
EXPOSE 8080
CMD ["npm", "start"]
