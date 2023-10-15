rm -rf ../lanstreamer-packages/lanstreamer-linux-x64
mkdir ../temp
mv ./Server/Files/Ffmpeg/Windows ../temp/Windows
electron-packager . lanstreamer --overwrite --asar --platform=linux --prune=true --out=../lanstreamer-packages --extra-resource='./Server/Files'
mv ../temp/Windows ./Server/Files/Ffmpeg/Windows
rm -r ../temp

cp package/snapcraft.yaml ../lanstreamer-packages/lanstreamer-linux-x64/