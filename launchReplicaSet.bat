@ECHO OFF
TITLE MongoDB ReplicaSet launch script

ECHO launching alpha...
START /B C:\"Program Files"\MongoDB\Server\4.2\bin\mongod --replSet rs0 --port 27017 --bind_ip localhost --dbpath C:\mongoReplicas\alpha --oplogSize 128

ECHO launching bravo...
START /B C:\"Program Files"\MongoDB\Server\4.2\bin\mongod --replSet rs0 --port 27018 --bind_ip localhost --dbpath C:\mongoReplicas\bravo --oplogSize 128

ECHO launching delta...
START /B C:\"Program Files"\MongoDB\Server\4.2\bin\mongod --replSet rs0 --port 27019 --bind_ip localhost --dbpath C:\mongoReplicas\delta --oplogSize 128

ECHO all done
