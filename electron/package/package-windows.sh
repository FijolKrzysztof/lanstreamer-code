mkdir ../temp
mv ./Server/Files/Ffmpeg/Linux ../temp/Linux
electron-packager . lanstreamer --overwrite --asar --platform=win32 --arch=ia32 --prune=true --out=../lanstreamer-packages --extra-resource='./Server/Files' --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName="Lanstreamer" --icon='./Server/Files/Icons/icon.ico'
mv ../temp/Linux ./Server/Files/Ffmpeg/Linux
rm -r ../temp