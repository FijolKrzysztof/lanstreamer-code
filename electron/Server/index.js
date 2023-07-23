const Function = require('./Function');
const Database = require('./Database');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const kill = require('kill-port');
const isElectron = require('is-electron');
const path = require('path');
const os = require('os');

if(isElectron()){
    const isDev = require('electron-is-dev');
    if(isDev){
        global.mainPath = __dirname + '/Files/';
    } else {
        global.mainPath = process.resourcesPath + '/Files/';
    }
} else {
    global.mainPath = __dirname + '/Files/';
}

if(os.platform() === 'linux'){
    global.ffmpegPath = global.mainPath + 'Ffmpeg/Linux/ffmpeg';
    global.ffprobePath = global.mainPath + 'Ffmpeg/Linux/ffprobe';
}
if(os.platform() === 'win32'){
    global.ffmpegPath = global.mainPath + 'Ffmpeg/Windows/ffmpeg.exe';
    global.ffprobePath = global.mainPath + 'Ffmpeg/Windows/ffprobe.exe';
}

global.characters = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    '0','1','2','3','4','5','6','7','8','9',
    '_','-',' ','(',')','[',']','{','}',',',';',':','&'
]

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../build')));

app.post('/videoUpdate', (req,res) => {
    Database.videoUpdate(req.body.name, req.body.itemName, req.body.data);
    res.send();
})

app.post('/checkConnection', (req,res) => {
    if(global.password === undefined || global.password === ''){
        res.send({ password: null });
    } else {
        res.send({ password: global.password })
    }
})

app.get('/preview/:id/:num', async(req,res) => {
    let name = req.params.id.slice(0, -4);
    let num = req.params.num;
    let convertNum = num > 999 ? num : num > 99 ? '0' + num : num > 9 ? '00' + num : '000' + num;
    let path = global.mainPath + 'Previews/' + name + '/scr-' + convertNum + '.jpg'; 
    if(fs.existsSync(path)){
        res.sendFile(path);
    } else {
        res.sendFile(global.mainPath + 'Previews/NoPreview.png');
    }
})

app.get('/createPreview/:name', async(req,res) => {
    let name = req.params.name.slice(0, -4);
    res.set("Content-Type", "text/html");
    if(!fs.existsSync(global.mainPath + 'Previews/' + name + '/scr-1000.jpg')){
        res.write('0%');
        if(!fs.existsSync(global.mainPath + 'Previews/' + name)){
            await fs.promises.mkdir(global.mainPath + 'Previews/' + name);
        }
        await Function.createPreview(name, res);
    } else {
        res.write('100%');
        setTimeout(() => {
            res.end();
        }, 500);
    }
})

app.post('/data', async(req,res) => {
    Function.confFfmpeg();
    let posters = await Function.getFiles(global.mainPath + 'Posters');
    let previews = await Function.getFiles(global.mainPath + 'Previews');
    let folderVideos = await Function.getFiles(global.mainPath + 'Videos');
    let response = await Function.checkExtension(folderVideos);
    if(response === undefined){
        folderVideos = await Function.renameVideos(folderVideos);
        let databaseVideos = await Database.videosRead();
        await Function.deleteDatabaseVideos(folderVideos, databaseVideos);
        await Function.deletePosters(folderVideos, posters);
        await Function.deletePreviews(folderVideos, previews);
        await Function.addVideos(folderVideos, databaseVideos);
        let videos = await Function.compareVideos(folderVideos);
        let categories = await Database.categoriesRead();
        categories = await Function.convertCategories(categories, videos);
        res.send({
            videos: videos,
            categories: categories
        })
    } else {
        res.send({ response: response })
    }
})

app.get('/video/:id', (req,res) => {
    res.sendFile(global.mainPath + 'Videos/' + req.params.id);
})

app.get('/changePoster/:id', async(req,res) => {
    let name = req.params.id.slice(0, -4);
    await Function.generatePoster(name);
    res.sendFile(global.mainPath + 'Posters/' + name + '.png');
})

app.get('/poster/:id', async(req,res) => {
    let name = req.params.id.slice(0, -4);
    if(!fs.existsSync(global.mainPath + 'Posters/' + name + '.png')){
        await Function.generatePoster(name);
    }
    res.sendFile(global.mainPath + 'Posters/' + name + '.png');
})

app.post('/rename', async(req,res) => {
    let prevName = req.body.prevName;
    let name = req.body.name;
    let extension = req.body.extension;
    if(prevName.slice(0, -4) === name){
        res.send('SUCCESS');
    } else {
        if(name.length < 100){
            if(name.length > 3){
                for(let i = 0; i < name.length; i ++){
                    let present = global.characters.includes(name[i]);
                    if(present === false){
                        res.send(`CHARACTER " ${name[i]} " NOT AVAILABLE`);
                        break;
                    }
                    if(i === name.length - 1){
                        let videos = await Database.videosRead();
                        for(let j = 0; j < videos.length; j ++){
                            if(name + extension === videos[j].name){
                                res.send('NAME ALREADY TAKEN');
                                break;
                            }
                            if(j === videos.length - 1){
                                Function.updateName(name, prevName, extension);
                                res.send('SUCCESS');
                            }
                        }
                    }
                }
            } else {
                res.send('NOT ENOUGH CHARACTERS');
            }
        } else {
            res.send('TOO MANY CHARACTERS');
        }
    }
})

app.get('/player', (req,res) => {
    res.redirect('/');
})

app.get('/settings', (req,res) => {
    res.redirect('/');
})

app.get('/videos', (req,res) => {
    res.redirect('/');
})

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

kill(global.port || 5555, 'tcp')
.then(() => {
    app.listen(global.port || 5555);
})
