
for file in $(find . -name "*.webm"); 
do
    # regenerate mp4
    mp4="${file%.webm}.mp4";
    if [ ! test -f "$mp4" ]
    then
        ffmpeg -y -i "$file" -an -pix_fmt yuv420p -movflags faststart "${file%.webm}.mp4";
    fi
done
