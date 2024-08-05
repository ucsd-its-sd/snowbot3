docker container rm snowbot3
docker run -d --name snowbot3 -v ./config:/home/snowbot/config ghcr.io/ucsd-its-sd/snowbot3:latest