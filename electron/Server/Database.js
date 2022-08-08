const Datastore = require('nedb');

let Video;
let Category;

setTimeout(() => {
    Video = new Datastore(global.mainPath + 'Databases/videos.db');
    Category = new Datastore(global.mainPath + 'Databases/categories.db');

    Video.loadDatabase();
    Category.loadDatabase();

    // module.exports.categoryInsert('All Videos', []);
})

module.exports.videoInsert = (name, length) => {
    Video.insert({ name: name, views: 0, length: length, date: new Date().getTime(), attention: 0, rate: 3 })
}

module.exports.videoUpdate = (name, itemName, data) => {
    Video.update({ name: name }, { $set: { [itemName]: data }}, {}, (err) => { if(err) console.log('VIDEO UPDATE ERROR') })
}

module.exports.videosRead = () => {
    return new Promise(resolve => {
        Video.find({}, { _id: 0 }, (err, data) => {
            if(err) console.log('VIDEO READ ERROR');
            resolve(data)
        })
    })
}

module.exports.videoDelete = (name) => {
    Video.remove({ name: name }, {}, (err) => { if(err) console.log('VIDEO DELETE ERROR') })
}

module.exports.categoryInsert = (name, videos) => {
    Category.insert({ name: name, videos: videos })
}

module.exports.categoryUpdate = (name, itemName, data, callback) => {
    Category.update({ name: name }, { $set: { [itemName]: data }}, {}, (err) => {
        if(err) console.log('CATEGORY UPDATE ERROR');
        return callback();
    })
}

module.exports.categoriesRead = () => {
    return new Promise(resolve => {
        Category.find({}, { _id: 0 }, (err, data) => {
            if(err) console.log('CATEGORY READ ERROR');
            resolve(data);
        })
    })
}
