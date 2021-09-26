for file in $(find . -name "*.gltf"); 
do  
    node ../../node_modules/gltfjsx/cli.js "$file" -s --transform
done
