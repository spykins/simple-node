
$ mkdir $PWD/my/custom
$ docker network ls
$ docker network create spykins -d bridge
$ docker run -d -p 27017:27017 --name test-mongo --network spykins  -v $PWD/my/custom:/data/db mongo:4.0.4

$ docker exec -it test-mongo bash
    > mongo
    > show dbs
    > use myDatabase
    > show collections
    > db.electionposts.find()

$ docker build -t spykins-demo .
$ docker run -d --name spykins-node --network spykins spykins-demo node /app/index.js
