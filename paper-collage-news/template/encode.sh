#!/usr/bin/env bash
# Two-pass x264 encode of the 9:16 video with the final audio mix, sized to land near 27 MB (capped at 2600k),
# plus a poster frame. usage: bash encode.sh <name> [poster_seconds=2]   -> <name>_9x16.mp4 and <name>_9x16.jpg
set -e
NAME=${1:?name}; POSTER=${2:-2}
NULL=/dev/null; [ "$OS" = "Windows_NT" ] && NULL=NUL
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/video_silent.mp4)
BR=$(awk -v d="$DUR" 'BEGIN{b=int(27*8*1024/d-140); if(b>2600)b=2600; print b}')
echo "9x16: ${DUR}s -> ${BR}k"
(cd out && ffmpeg -v error -y -i video_silent.mp4 -c:v libx264 -preset slow -tune animation -b:v ${BR}k -maxrate 5000k -bufsize 10000k -pass 1 -passlogfile x264 -an -f mp4 $NULL)
ffmpeg -v error -y -i out/video_silent.mp4 -i out/audio_final.wav -c:v libx264 -preset slow -tune animation -b:v ${BR}k -maxrate 5000k -bufsize 10000k \
  -pass 2 -passlogfile out/x264 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart -shortest "${NAME}_9x16.mp4"
ffmpeg -v error -y -ss "$POSTER" -i "${NAME}_9x16.mp4" -frames:v 1 -vf scale=720:-2 -q:v 4 "${NAME}_9x16.jpg"
ls -la "${NAME}_9x16.mp4" "${NAME}_9x16.jpg"
