const open = require('open');
const fs = require('fs');
const ip = require('ip');
const { ipcRenderer } = require('electron');
const axios = require('axios');
const { machineId } = require('node-machine-id');
const os = require('os');
const https = require('https')

let version = '1';
let port = 5555;
let website = 'https://lanstreamer.com/';
// let serverAddress = 'http://localhost:5150/api/'
let serverAddress = 'https://lanstreamer.com:5000/api/';

let fullInfo = `Open the program on another device:\n
1. Start Lanstreamer.
2. Connect the device to the same network.
3. Open the device browser.
4. Paste url: "${ip.address()}:${port}".`

let timeout;

document.getElementById('info').innerText = fullInfo;

let path;
let messagePath;
let message;

ipcRenderer.send('port', port);

if(process.resourcesPath.includes('node_modules')){
    path = __dirname + '/Server/Files/Videos';
    messagePath = 'Server/Files/Videos';
} else {
    if(os.platform() === 'linux'){
        path = process.resourcesPath + '/Files/Videos';
        messagePath = 'resources/Files/Videos'
    }
    if(os.platform() === 'win32'){
        path = process.resourcesPath + '\\Files\\Videos';
        messagePath = 'resources\\Files\\Videos';
    }
}

fs.readdir(path, (err, files) => {
    if(err){
        message = 'Cannot find folder with videos';
    } else {
        if(!files.length){
            message = 'Add videos to: ' + messagePath;
        } else {
            document.getElementById('warningContainer').style.display = 'none';
        }
    }
    document.getElementById('warning').innerText = message;
    let warningWidth = document.getElementById('warning').scrollWidth;
    if(warningWidth > 349){
        document.getElementById('warning').style.justifyContent = 'left';
    } else {
        document.getElementById('warning').style.justifyContent = 'center';
    }
});

if(localStorage.password !== undefined){
    document.getElementById('password').value = localStorage.password;
    ipcRenderer.send('password', localStorage.password);
}

if(localStorage.userLogin !== undefined){
    document.getElementById('loginInput').value = localStorage.userLogin;
}

if(localStorage.userPassword !== undefined){
    document.getElementById('passwordInput').value = localStorage.userPassword;
}

for(let i = 0; i < 50; i++){
    document.getElementsByClassName('margin')[0].innerText += '.|..|..|..|..|.'
    document.getElementsByClassName('margin')[1].innerText += '.|..|..|..|..|.';
}

function getAccess(url, index) {
    axios.get(url, {httpsAgent: new https.Agent({rejectUnauthorized: false})})
        .then(response => {
            if (+response?.data) {
                localStorage.offline = +response.data;
                ipcRenderer.send('open');
                setTimeout(() => {
                    open('http://localhost:' + port);
                    animateText('Logged in!')
                })
            } else {
                animateText('Cannot login!')
            }
        })
        .catch((error) => {
            if (index < 60) {
                setTimeout(() => {
                    getAccess(url, index++)
                }, 1000)
            } else {
                animateText(error?.message ?? 'Cannot login!');
            }
        })
}

function start(){
    if(localStorage.offline > 0){
        localStorage.offline --;
        ipcRenderer.send('open');
        setTimeout(() => {
            open('http://localhost:' + port);
        })
    } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const urlId = Math.floor(1000000000 + Math.random() * 9000000000);
        open(website + 'authentication/' + urlId);

        getAccess(serverAddress + 'main/app/access/' + urlId + '/' + version, 0)
    }
}

function setPassword(){
    let data = document.getElementById('password').value;
    localStorage.password = data;
    ipcRenderer.send('password', data)
}

function createAccount(){
    open(website);
}

function showMigrationInfo(){
    document.getElementById('login').style.display = 'none';
    document.getElementById('migrationInfo').style.display = 'flex';
}

function closeMigrationInfo(){
    document.getElementById('migrationInfo').style.display = 'none';
    document.getElementById('login').style.display = 'flex';
}

function home(){
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
}

function animateText(text, count = 0){
    clearTimeout(timeout);
    if(count < text.length + 1){
        document.getElementById('message').innerText = text.slice(0, count);
        count ++;
        timeout = setTimeout(() => {
            animateText(text, count);
        }, 50)
    }
}
