name="$1"
file="$name.webm"
fixed="$name.fixed.webm";
ffmpeg -y -i "$file" -an -vf "scale='min(1080, iw)':-1" -preset slow -crf 18 "$fixed";
mv "$fixed" "$file";
ffmpeg -y -i "$file" -an -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -preset slow -crf 18 "$fixed";
mv "$fixed" "$file";
jpg="$name.jpg";
ffmpeg -y -i "$file" -frames:v 1 "../../static/videos/$jpg";
mp4="$name.mp4";
ffmpeg -y -i "$file" -pix_fmt yuv420p -movflags faststart "../../static/videos/$mp4";
webm="$name.webm";
ffmpeg -y -i "$file" -pix_fmt yuv420p -movflags faststart "../../static/videos/$webm";
