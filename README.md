docker run -d -p 8080:27017 -v election-ca:/var/lib/mongodb --name=mongo-example -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=secret mongo:latest
$ docker exec -it mongo-example mongo


docker run -d -p 27017:27017 --name test-mongo -v $PWD/my/custom:/data/db mongo:4.0.4
docker exec -it test-mongo bash
    > mongo
    > show dbs
    > use myDatabase
    > show collections
    > db.electionposts.find()
