
cd src/videos
for file in $(find . -name "*.webm"); 
do
    # regenerate jpg
    jpg="${file%.webm}.jpg";
    if [ ! -f "../../static/videos/$jpg" ]; then
        ffmpeg -y -i "$file" -frames:v 1 "../../static/videos/$jpg";
    fi
    # regenerate mp4
    mp4="${file%.webm}.mp4";
    if [ ! -f "../../static/videos/$mp4" ]; then
        ffmpeg -y -i "$file" -an -pix_fmt yuv420p -movflags faststart "../../static/videos/$mp4";
    fi
    # regenerate min.webm
    webm="${file%.webm}.webm";
    if [ ! -f "../../static/videos/$webm" ]; then
        ffmpeg -y -i "$file" -an -pix_fmt yuv420p -movflags faststart "../../static/videos/$webm";
    fi
done
