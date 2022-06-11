
cd src/videos
for file in $(find . -name "*.webm"); 
do
    fixed="${file%.webm}.fixed.webm";
    ffmpeg -y -i "$file" -an -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -preset slow -crf 18 "$fixed";
    mv "$fixed" "$file";
    ffmpeg -y -i "$file" -an -vf "scale='min(1080, iw)':-1" -preset slow -crf 18 "$fixed";
    mv "$fixed" "$file";
done
