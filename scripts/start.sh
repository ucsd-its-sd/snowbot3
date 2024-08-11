docker container stop snowbot3
docker run -d --rm --name snowbot3 --log-driver=journald -v ./config:/home/snowbot/config ghcr.io/ucsd-its-sd/snowbot3:latest