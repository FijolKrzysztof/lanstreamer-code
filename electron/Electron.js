const open = require('open');
const fs = require('fs');
const ip = require('ip');
const { ipcRenderer } = require('electron');
const axios = require('axios');
const { machineId } = require('node-machine-id');
const os = require('os');

let version = '1.0';
let port = 5555;
let website = 'https://lanstreamer.com/login/';
let serverAddress = 'https://lanstreamer.com/';

let fullInfo = `Open the program on another device:\n
1. Connect the device to the same network.
2. Open the device browser.
3. Go to: "${ip.address()}:${port}".
4. Click "GET STARTED" button.`

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

function start(){
    if(localStorage.offline > 0){
        localStorage.offline --;
        ipcRenderer.send('open');
        setTimeout(() => {
            open('http://localhost:' + port);
        })
    } else {
        document.getElementById('app').style.display = 'none';
        document.getElementById('login').style.display = 'flex';
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

async function confirm(){
    let login = document.getElementById('loginInput').value;
    let password = document.getElementById('passwordInput').value;
    let id = await machineId();
    if(login === '' || password === '') animateText('Login or password field empty.')
    else {
        localStorage.userLogin = login;
        localStorage.userPassword = password;
        axios.default.get(serverAddress + 'player/' + login + '/' + password + '/' + id + '/' + version)
        .then((message) => {
            if(message.data.access === true){
                animateText('Success.');
                setTimeout(() => {
                    open('http://localhost:' + port);
                    ipcRenderer.send('open');
                }, 500)
                localStorage.offline = parseInt(message.data.offline);
            } else {
                if(message.data === 'Unrecognised device.'){
                    animateText(message.data);
                    setTimeout(() => {
                        animateText('Reset device on the website.')
                    }, 2000)
                } else if(message.data === 'Outdated Version.'){
                    animateText(message.data);
                    setTimeout(() => {
                        animateText('Download latest one.')
                    }, 2000)
                } else {
                    animateText(message.data);
                }
            }
        })
        .catch(() => animateText('Server error.'))
    }
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
