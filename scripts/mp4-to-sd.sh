
cd src/videos
for file in $(find . -name "*.webm"); 
do
    # regenerate mp4
    mp4="${file%.webm}.mp4";
    ffmpeg -y -i "$file" -pix_fmt yuv420p -movflags faststart -vf "scale=640:trunc(ih/iw*640/2)*2" "../../static/videos/$mp4";
done
