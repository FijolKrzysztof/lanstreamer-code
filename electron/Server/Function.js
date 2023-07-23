const Database = require('./Database');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

module.exports.confFfmpeg = () => {
    ffmpeg.setFfmpegPath(global.ffmpegPath);
    ffmpeg.setFfprobePath(global.ffprobePath);
}

module.exports.getFiles = (path) => {
    return new Promise(resolve => {
        fs.readdir(path, (err, files) => {
            resolve(files);
        })
    })
}

module.exports.checkExtension = (videos) => {
    return new Promise(resolve => {
        for(let i = 0; i < videos.length; i ++){
            let extension = videos[i].slice(videos[i].length - 4);
            if(extension !== '.mp4'){
                resolve('FILE HAS WRONG EXTENSION: "' + extension + '"');
            }
            if(i === videos.length - 1) resolve();
        }
        if(videos.length === 0) resolve()
    })
}

module.exports.renameVideos = (videos) => {
    return new Promise(resolve => {
        for(let i = 0; i < videos.length; i ++){
            for(let j = 0; j < videos[i].length - 4; j ++){
                let present = global.characters.includes(videos[i][j]);
                if(present === false){
                    let newStr = videos[i].replace(videos[i][j], '_');
                    fs.rename(global.mainPath + 'Videos/' + videos[i], global.mainPath + 'Videos/' + newStr, (err => {
                        if(err) console.log('VIDEO RENAME ERROR');
                    }))
                    videos[i] = newStr;
                }
            }
            if(i === videos.length - 1) resolve(videos);
        }
        if(videos.length === 0) resolve(videos);
    })
}

module.exports.deleteDatabaseVideos = (folderVideos, databaseVideos) => {
    return new Promise(resolve => {
        for(let i = 0; i < databaseVideos.length; i ++){
            let present = folderVideos.includes(databaseVideos[i].name);
            if(present === false){
                Database.videoDelete(databaseVideos[i].name);
            }
            if(i === databaseVideos.length - 1) resolve();
        }
        if(databaseVideos.length === 0) resolve();
    })
}

module.exports.deletePosters = (videos, posters) => {
    return new Promise(resolve => {
        for(let i = 0; i < posters.length; i ++){
            let present = videos.includes(posters[i].slice(0, -4) + '.mp4');
            if(present === false){
                fs.unlink(global.mainPath + 'Posters/' + posters[i], (err => {
                    if(err) console.log('POSTER DELETE ERROR')
                }));
            }
            if(i === posters.length - 1) resolve();
        }
        if(posters.length === 0) resolve();
    })
}

module.exports.deletePreviews = (videos, previews) => {
    return new Promise(resolve => {
        for(let i = 0; i < previews.length; i ++){
            let present = videos.includes(previews[i] + '.mp4');
            if(present === false && previews[i] !== 'NoPreview.png'){
                fs.rmdirSync(global.mainPath + 'Previews/' + previews[i], { recursive: true }, (err => {
                    if(err) console.log(err + 'PREVIEW DELETE ERROR')
                }));
            }
            if(i === previews.length - 1) resolve();
        }
    })
}

module.exports.addVideos = (folderVideos, databaseVideos) => {
    return new Promise(resolve => {
        let updateVideos = [];
        for(let i = 0; i < folderVideos.length; i ++){
            let present = false;
            for(let j = 0; j < databaseVideos.length; j ++){
                if(databaseVideos[j].name === folderVideos[i]){
                    updateVideos.push(databaseVideos[j].name);
                    present = true;
                }
            }
            if(present === false){
                ffmpeg.ffprobe(global.mainPath + 'Videos/' + folderVideos[i], (err, metadata) => {
                    let seconds = metadata.format.duration.toFixed(0);
                    Database.videoInsert(folderVideos[i], seconds);
                })
                updateVideos.push(folderVideos[i]);
            }
            if(i === folderVideos.length - 1){
                Database.categoryUpdate('All Videos', 'videos', updateVideos, function(){
                    resolve();
                });
            }
        }
        if(folderVideos.length === 0){
            Database.categoryUpdate('All Videos', 'videos', updateVideos, function(){
                resolve();
            })
        }
    })
}

module.exports.compareVideos = (folderVideos) => {
    return new Promise(async(resolve) => {
        let videos = await Database.videosRead();
        if(videos.length === folderVideos.length){
            resolve(videos);
        } else {
            setTimeout(() => {
                resolve(this.compareVideos(folderVideos));
            }, 100)
        }
    })
}

module.exports.convertCategories = (categories, videos) => {
    return new Promise(resolve => {
        for(let i = 0; i < categories.length; i ++){
            for(let j = 0; j < categories[i].videos.length; j ++){
                for(let k = 0; k < videos.length; k ++){
                    if(categories[i].videos[j] === videos[k].name){
                        categories[i].videos.splice(j, 1, k);
                    }
                }
                if(typeof(categories[i].videos[j]) === 'string'){
                    categories[i].videos.splice(j, 1);
                    j --;
                }
            }
            if(i === categories.length - 1) resolve(categories);
        }
    })
}

module.exports.getRandom = (min, max) => {
    return Math.random() * (max - min) + min;
}

module.exports.generatePoster = (name) => {
    return new Promise((resolve, reject) => {
        let path = global.mainPath + 'Videos/' + name + '.mp4';
        new ffmpeg(path)
        .takeScreenshots({
            timemarks: [module.exports.getRandom(0, 100) + '%'],
            filename: name
        }, global.mainPath + 'Posters/', function(err){ reject(err) })
        .on('end', function(){
            resolve();
        })
    })
}

module.exports.createPreview = (name, res) => {
    return new Promise(resolve => {
        let path = global.mainPath + 'Videos/' + name + '.mp4';
        ffmpeg.ffprobe(path, function(err, metadata){
            let noOfFrames = 1000;
            let duration = metadata.format.duration;
            let timestamp = duration / noOfFrames;
            ffmpeg(path)
                .on('end', function () {
                    res.end();
                    resolve();
                })
                .on('progress', function (progress) {
                    let percent = (progress.percent.toFixed(0).toString()) + '%';
                    res.write(percent.toString());
                })
                .output(global.mainPath + 'Previews/' + name + '/scr-%04d.jpg')
                .outputOptions(
                    '-frames', noOfFrames,
                    '-vf', 'fps=1/' + timestamp,
                    '-q:v', '31',
                    '-vcodec', 'png',
                )
                .run()
        });
    })
}

module.exports.updateName = async(name, prevName, extension) => {
    Database.videoUpdate(prevName, 'name', name + extension);
    let categories = await Database.categoriesRead();
    for(let i = 0; i < categories.length; i ++){
        for(let j = 0; j < categories[i].videos.length; j ++){
            if(categories[i].videos[j] === prevName){
                let videos = categories[i].videos;
                videos.splice(j, 1, name + extension);
                Database.categoryUpdate(categories[i].name, 'videos', videos, function(){});
            }
        }
    }
    fs.rename(global.mainPath + 'Videos/' + prevName, global.mainPath + 'Videos/' + name + extension, (err => {
        if(err) console.log('VIDEO RENAME ERROR');
    }))
    fs.rename(global.mainPath + 'Posters/' + prevName.slice(0, -4) + '.png', global.mainPath + 'Posters/' + name + '.png', (err => {
        if(err) console.log('POSTER RENAME ERROR');
    }))
    let prevPath = global.mainPath + 'Previews/' + prevName.slice(0, -4);
    let newPath = global.mainPath + 'Previews/' + name;
    if(fs.existsSync(prevPath)){
        fs.rename(prevPath, newPath, (err => {
            if(err) console.log('PREVIEW RENAME ERROR');
        }))
    }
}
