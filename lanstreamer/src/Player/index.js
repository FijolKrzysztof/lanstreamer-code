import React, { Component } from 'react';
import { Action } from '../Store';
import { connect } from 'react-redux';
import style from './index.module.scss';
import NavButton from './NavButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCaretSquareLeft,
    faCaretSquareRight,
    faPlus,
    faTrash,
    faArrowLeft,
    faExpandArrowsAlt,
    faCompressArrowsAlt,
    faVolumeUp,
    faVolumeDown,
    faVolumeMute,
    faPlay,
    faPause,
    faAngleUp,
    faAngleDown,
    faFastBackward,
    faFastForward
} from '@fortawesome/free-solid-svg-icons';
import History from '../History';
import axios from 'axios';

let mouseUp = true;
let changed = [];
let countingAttention = false;
let clickCount = 0;
let timeout;
let leftForwardTimeout;
let rightForwardTimeout;

class Player extends Component {
    constructor(props){
        super(props);
        this.state = {
            navButtons: [],
            name: null,
            fullScreen: false,
            playing: false,
            duration: '00:00',
            previewTime: '00:00',
            inChange: false,
            createPreviewProgress: '',
            update: false,
            progress: '00:00',
            showVolume: false,
            hidden: false,
            visible: true,
            overControls: false
        }
    }

    componentDidMount = () => {
        setTimeout(() => {
            this.props.ChosenVideos.forEach(video => {
                this.addButton(video)
            });
        })
        document.addEventListener('keydown', this.detectKey, false);
        document.addEventListener('fullscreenchange', () => {
            if(!document.fullscreenElement){
                document.getElementById('playerContainer').style = style.playerContainer;
                this.setState({ fullScreen: false });
            }
        });
    }

    changeVideo = (name) => {
        let link = window.webAddress + 'video/' + name;
        this.setState({ name: name, playing: false, visible: true });
        document.getElementById('player').setAttribute('src', link);
    }

    addButton = (name) => {
        const navButtons = this.state.navButtons;
        this.setState({ navButtons: navButtons.concat( <NavButton
            name={ name }
            changeVideo={ this.changeVideo }
            key={ navButtons.length }
        /> )})
    }

    slide = (command) => {
        let windowWidth = window.innerWidth;
        document.getElementById('navBar').scrollBy({ left: windowWidth / 2 * command, behavior: 'smooth' });
    }

    fold = () => {
        let foldMenu = document.getElementById('foldMenu');
        let button = document.getElementsByClassName(style.menuButton);
        let createPreview = document.getElementsByClassName(style.createPreviewButton)[0];
        let height = foldMenu.offsetHeight;
        if(height === 70){
            foldMenu.style.animation = 'foldMenu 0.5s';
            button[0].style.animation = 'menuFoldButton 0.5s forwards';
            setTimeout(() => {
                foldMenu.style.height = '210px';
                foldMenu.style.animation = '';
                button[0].style.animation = '';
                button[0].style.transform = 'rotate(45deg)';
                button[1].style.display = 'block';
                button[2].style.display = 'block';
                createPreview.style.animation = 'createPreviewButton 0.3s';
                createPreview.style.display = 'flex';
                setTimeout(() => {
                    createPreview.style.animation = '';
                    createPreview.style.left = '70px';
                }, 250)
            }, 400)
        }
        if(height === 210){
            createPreview.style.animation = 'createPreviewButton 0.3s reverse ease-in';
            setTimeout(() => {
                createPreview.style.animation = '';
                createPreview.style.left = '40px';
                createPreview.style.display = 'none';
                button[1].style.display = 'none';
                button[2].style.display = 'none';
                foldMenu.style.animation = 'foldMenu 0.5s reverse ease-in';
                button[0].style.animation = 'menuFoldButton 0.5s reverse ease-in';
                setTimeout(() => {
                    foldMenu.style.height = '70px';
                    foldMenu.style.animation = '';
                    button[0].style.animation = '';
                    button[0].style.transform = 'rotate(0deg)';
                }, 400)
            }, 250)
        }
    }

    createPreviewOver = () => {
        document.getElementsByClassName(style.createPreviewButton)[0].style.left = '80px';
    }

    createPreviewLeave = () => {
        document.getElementsByClassName(style.createPreviewButton)[0].style.left = '70px';
    }

    createPreview = () => {
        if(window.demo === false){
            if(this.state.name !== null && this.state.createPreviewProgress === ''){
                let path = window.webAddress + 'createPreview/' + this.state.name;
                let lastPos = 0;
                let request = new XMLHttpRequest()
                request.open('GET', path);
                request.send();
                request.onreadystatechange = () => {
                    let data = request.responseText.substring(lastPos);
                    lastPos = request.responseText.length;
                    data = data.slice(0, data.indexOf('%') + 1);
                    this.setState({ createPreviewProgress: data });
                }
            }
        } else {
            this.setState({ createPreviewProgress: '100%' });
            setTimeout(() => {
                this.setState({ createPreviewProgress: '' });
            }, 500)
        }
    }

    delete = () => {
        let name = this.state.name;
        let array = this.state.navButtons;
        if(name !== null){
            for(let i = 0; i < array.length; i ++){
                if(array[i].props.name === name){
                    this.setState({ update: false, visible: false, playing: false }, () => {
                        document.getElementById('player').style.cursor = 'pointer';
                        document.getElementById('player').setAttribute('src', null);
                        document.getElementById('previewPlayer').setAttribute('src', null);
                        this.setState({ name: null, navButtons: array.filter((value, index) => index !== i) });
                        this.props.dispatch(Action('CHOSEN VIDEOS REMOVE', i));
                        return;
                    })
                }
            }
        }
    }

    goBack = () => {
        this.setState({ update: false, visible: false, playing: false }, () => {
            document.removeEventListener('keydown', this.detectKey, false);
            History.push('/videos');
        })
    }

    fullScreen = () => {
        if(document.fullscreenElement){
            document.exitFullscreen();
        } else {
            document.getElementById('playerContainer').requestFullscreen();
            document.getElementById('playerContainer').style.width = '100vw';
            document.getElementById('playerContainer').style.height = 'calc(100vw * 0.5625)';
            document.getElementById('playerContainer').style.maxWidth = 'calc(100vh / 0.5625)';
            document.getElementById('playerContainer').style.maxHeight = '100vh';
            this.setState({ fullScreen: true });
        }
    }

    play = () => {
        let player = document.getElementById('player');
        if(player.paused){
            player.play();
            this.setState({ playing: true }, () => { this.preCountAttention() });
        } else {
            player.pause();
            this.setState({ playing: false });
        }
    }

    convertTime = (seconds) => {
        let hour = Math.floor(Math.floor(seconds / 60) / 60);
        let minute = Math.floor(seconds / 60) - hour * 60;
        let second = Math.round(seconds - (minute * 60 + hour * 60 * 60));
        let time = `${hour === 0 ? '' : hour + ':'}${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`;
        return time;
    }

    duration = () => {
        let player = document.getElementById('player');
        let duration = this.convertTime(player.duration);
        this.setState({ duration: duration });
        if(this.state.update !== true){
            this.setState({ update: true }, () => { this.update() })
        }
        this.changeVolume(0);
    }

    progress = (value) => {
        this.setState({ inChange: false, update: false });
        document.getElementById('preview').style.display = 'none';
        document.getElementById('progress').style.background = `linear-gradient(90deg, rgb(104, 130, 177) ${value / 100}%, rgb(204, 204, 204) ${value / 100}%)`;
        let duration = document.getElementById('player').duration;
        document.getElementById('player').currentTime = value / 10000 * duration;
        this.setState({ update: true }, () => { this.update() });
    }

    change = (progress) => {
        this.setState({ inChange: true, update: false });
        document.getElementById('preview').style.display = 'flex';
        let width = document.getElementById('controls').offsetWidth;
        let shrink = width - 200;
        let move = progress / 10000 * shrink;
        document.getElementById('preview').style.left = `${move}px`;
        let duration = document.getElementById('player').duration;
        let num = Math.floor(progress / 10);
        let posterLink = window.webAddress + 'preview/' + this.state.name + '/' + num;
        document.getElementById('previewPlayer').setAttribute('poster', posterLink);
        this.setState({ previewTime: this.convertTime(progress / 10000 * duration) });
    }

    over = (e) => {
        if(this.state.inChange === false){
            document.getElementById('preview').style.display = 'flex';
            let progressStart = document.getElementById('progress').getBoundingClientRect().x;
            let progressWidth = document.getElementById('progress').offsetWidth;
            let mousePosition = e.clientX;
            let progress = ((mousePosition - progressStart) / progressWidth);
            if(progress < 0) progress = 0;
            let width = document.getElementById('controls').offsetWidth;
            let shrink = width - 200;
            let move = progress * shrink;
            document.getElementById('preview').style.left = `${move}px`;
            let duration = document.getElementById('player').duration;
            let num = parseInt(progress.toFixed(3).substring(2));
            let posterLink = window.webAddress + 'preview/' + this.state.name + '/' + num;
            document.getElementById('previewPlayer').setAttribute('poster', posterLink);
            this.setState({ previewTime: this.convertTime(progress * duration) });
        }
    }

    out = () => {
        if(this.state.inChange === false) document.getElementById('preview').style.display = 'none';
    }

    update = () => {
        if(this.state.update === true){
            let seconds = document.getElementById('player').currentTime;
            let progress = this.convertTime(seconds);
            this.setState({ progress: progress });
            let duration = document.getElementById('player').duration;
            let percent = Math.round(seconds / duration * 10000);
            document.getElementById('progress').value = percent;
            document.getElementById('progress').style.background = `linear-gradient(90deg, rgb(104, 130, 177) ${percent / 100}%, rgb(204, 204, 204) ${percent / 100}%)`;    
            setTimeout(() => {
                this.update();
            }, 100)
        }
    }

    fastButtonLoop = (change) => {
        if(mouseUp === false){
            setTimeout(() => {
                if(mouseUp === false){
                    this.changeVolume(change);
                    this.fastButtonLoop(change);
                }
            }, 10)
        }
    }

    handleFastButtons = (type, change) => {
        if(type === 'click') this.changeVolume(change);
        if(type === 'down'){
            mouseUp = false;
            changed.push(false);
            let place = changed.length-1;
            setTimeout(() => {
                if(mouseUp === false && changed[place] === false) this.fastButtonLoop(change)
            }, 500)
        }
        if(type === 'up'){
            mouseUp = true;
            for(let i = changed.length-1; i > -1; i --) changed[i] = true;
        }
    }

    changeVolume = (change) => {
        let volume = this.props.Volume + change;
        if(volume > -1 && volume < 101){
            this.props.dispatch(Action('VOLUME UPDATE', volume))
            document.getElementById('player').volume = volume / 100;
        }
    }

    showVolume = () => {
        let volumeContainer = document.getElementById('volumeContainer');
        if(this.state.showVolume === false){
            this.setState({ showVolume: true }, () => { volumeContainer.style.display = 'flex' })
        } else {
            this.setState({ showVolume: false }, () => { volumeContainer.style.display = 'none' })
        }
    }

    showHide = (e) => {
        if(this.state.name !== null){
            if(e !== undefined){
                let playerStart = document.getElementById('player').getBoundingClientRect().y;
                let playerHeight = document.getElementById('player').offsetHeight;
                let mousePosition = e.clientY;
                let position = ((mousePosition - playerStart) / playerHeight);
                if(position > 0.33 && position < 0.67){
                    document.getElementById('playerButtons').style = style.playerButtons;
                } else {
                    document.getElementById('playerButtons').style.color = 'rgba(255, 255, 255, .0)';
                }
            }
            clearTimeout(window.timeout);
            this.setState({ hidden: false });
            document.getElementById('controls').style.opacity = '1';
            document.getElementById('playerButtons').style.opacity = '1';
            document.getElementById('player').style.cursor = 'pointer';
            window.timeout = setTimeout(() => {
                if(this.state.visible === true && this.state.overControls === false){
                    this.setState({ hidden: true })
                    document.getElementById('controls').style.opacity = '0';
                    document.getElementById('playerButtons').style.opacity = '0';
                    document.getElementById('player').style.cursor = 'none';
                }
            }, 2000)
        }
    }

    overControls = (command) => {
        if(command === 'enter'){
            this.setState({ overControls: true });
        }
        if(command === 'leave'){
            this.setState({ overControls: false });
        }
    }

    detectKey = (e) => {
        e.preventDefault();
        if(this.state.name !== null){
            let player = document.getElementById('player');
            let volumeContainer = document.getElementById('volumeContainer');
            if(e.keyCode === 32){
                this.play();
            }
            if(e.keyCode === 37){
                let time = player.currentTime;
                player.currentTime = time - 10;
            }
            if(e.keyCode === 39){
                let time = player.currentTime;
                player.currentTime = time + 10;
            }
            if(e.keyCode === 38){
                clearTimeout(window.volumeTimeout);
                this.showHide();
                this.setState({ showVolume: true }, () => { volumeContainer.style.display = 'flex' })
                this.changeVolume(1);
                window.volumeTimeout = setTimeout(() => {
                    this.setState({ showVolume: false }, () => { volumeContainer.style.display = 'none' })
                }, 1000)
            }
            if(e.keyCode === 40){
                clearTimeout(window.volumeTimeout);
                this.showHide();
                this.setState({ showVolume: true }, () => { volumeContainer.style.display = 'flex' })
                this.changeVolume(-1);
                window.volumeTimeout = setTimeout(() => {
                    this.setState({ showVolume: false }, () => { volumeContainer.style.display = 'none' })
                }, 1000)
            }
        }
    }

    rewind = (e) => {
        let width = window.innerWidth;
        let position = e.clientX;
        if(position / width < 0.33){
            let time = document.getElementById('player').currentTime;
            document.getElementById('player').currentTime = time - 10;
            let element = document.getElementsByClassName(style.faFastButton)[0];
            element.style.color = 'rgba(255, 255, 255, .3)';
            clearTimeout(leftForwardTimeout)
            leftForwardTimeout = setTimeout(() => {
                element.style = style.faFastButton;
            }, 500)
        } else if(position / width > 0.66){
            let time = document.getElementById('player').currentTime;
            document.getElementById('player').currentTime = time + 10;
            let element = document.getElementsByClassName(style.faFastButton)[1];
            element.style.color = 'rgba(255, 255, 255, .3)';
            clearTimeout(rightForwardTimeout)
            rightForwardTimeout = setTimeout(() => {
                element.style = style.faFastButton;
            }, 500)
        } else {
            this.fullScreen()
        }
    }

    preCountAttention = () => {
        let name = this.state.name;
        let VideoData = this.props.VideoData;
        for(let i = 0; i < VideoData.length; i ++){
            if(VideoData[i].name === name){
                this.countAttention(i);
                return;
            }
        }
    }

    countAttention = (index) => {
        if(this.state.playing === true){
            if(countingAttention === false){
                countingAttention = true;
                let VideoData = this.props.VideoData[index];
                VideoData.attention += 1;
                this.props.dispatch(Action('VIDEO DATA UPDATE', VideoData, index));
                if(window.webAddress !== window.heroku && window.developmentMode === false){
                    axios.post(window.webAddress + 'videoUpdate', { name: VideoData.name, itemName: 'attention', data: VideoData.attention });
                }
                setTimeout(() => {
                    countingAttention = false;
                    this.countAttention(index);
                }, 1000)
            }
        } else {
            countingAttention = false;
        }
    }

    videoEnded = () => {
        this.setState({ playing: false });
    }

    detectClick = (e) => {
        if(this.state.name !== null){
            if(this.state.hidden === false){
                clickCount ++;
                if(clickCount === 1){
                    document.getElementById('playerButtons').style.color = 'rgba(255, 255, 255, .2)';
                    timeout = setTimeout(() => {
                        clickCount = 0;
                        document.getElementById('playerButtons').style = style.playerButtons;
                        this.play();
                    }, 200);
                } else if(clickCount === 2){
                    clearTimeout(timeout);
                    clickCount = 0;
                    document.getElementById('playerButtons').style = style.playerButtons;
                    this.rewind(e);
                }
                this.showHide();
            } else {
                this.showHide();
            } 
        }
    }

    render(){
        return(
            <div>
                <button onClick={() => this.slide(-1)} id={ style.backButton } className={ style.navButton }>
                    <FontAwesomeIcon icon={ faCaretSquareLeft } />
                </button>
                <div id={ 'navBar' } className={ style.navBar }>
                    <div className={ style.margin } />
                    { this.state.navButtons }
                    <div className={ style.margin } />
                </div>
                <button onClick={() => this.slide(1)} id={ style.forwardButton } className={ style.navButton }>
                        <FontAwesomeIcon icon={ faCaretSquareRight } />
                </button>
                <button className={ style.createPreviewButton }
                    onMouseMove={ this.createPreviewOver }
                    onMouseLeave={ this.createPreviewLeave }
                    onClick={ this.createPreview }
                >
                    <div className={ style.createPreviewText }>Create Preview</div>
                    <div className={ style.createPreviewPercent }>{ this.state.createPreviewProgress }</div>
                </button>
                <div id={ 'foldMenu' } className={ style.menu }>
                    <button onClick={ this.fold } id={ style.menuFoldButton } className={ style.menuButton }>
                        <FontAwesomeIcon icon={ faPlus } />
                    </button>
                    <button onClick={ this.delete } className={ style.menuButton }>
                        <FontAwesomeIcon icon={ faTrash } />
                    </button>
                    <button onClick={ this.goBack } className={ style.menuButton }>
                        <FontAwesomeIcon icon={ faArrowLeft } />
                    </button>
                </div>
                <div className={ style.container }>
                    <div id={ 'playerContainer' } className={ style.playerContainer } onMouseMove={ this.showHide }>
                        <video className={ style.player } id={ 'player' } 
                            onLoadedMetadata={ this.duration }
                            onClick={ this.detectClick }
                            onEnded={ this.videoEnded }
                        />
                        {
                            this.state.name === null ?
                            <div className={ style.info }>no video selected</div> :
                            [
                                <div id='playerButtons' className={ style.playerButtons } key={ 'key0' }>
                                    <div className={ style.faFastButton }>
                                        <FontAwesomeIcon icon={ faFastBackward } />
                                    </div>
                                    <div className={ style.playButton }>
                                        {
                                            this.state.playing === false ?
                                            <FontAwesomeIcon icon={ faPlay } /> :
                                            <FontAwesomeIcon icon={ faPause } />
                                        }
                                    </div>
                                    <div className={ style.faFastButton }>
                                        <FontAwesomeIcon icon={ faFastForward } />
                                    </div>
                                </div>
                                
                                ,
                                <div id={ 'controls' } className={ style.controls } key={ 'key1' }
                                    onMouseEnter={() => this.overControls('enter')}
                                    onMouseLeave={() => this.overControls('leave')}
                                >
                                    <div className={ style.preview } id={ 'preview' }>
                                        <div className={ style.previewCover }></div>
                                        <video className={ style.previewPlayer } id={ 'previewPlayer' } />
                                        <div className={ style.previewText }>{ this.state.previewTime }</div>
                                    </div>
                                    <div className={ style.time }>{ this.state.progress }</div>
                                    <input type='range' min='0' max='10000' id={ 'progress' } className={ style.slider }
                                        onChange={(e) => this.change(e.target.value)}
                                        onMouseMove={(e) => this.over(e)}
                                        onTouchEnd={(e) => this.progress(e.target.value)}
                                        onMouseUp={(e) => this.progress(e.target.value)}
                                        onMouseOut={ this.out }
                                        onKeyDown={(event) => event.preventDefault() }
                                    />
                                    <div className={ style.time }>{ this.state.duration }</div>
                                    <div id='volumeContainer' className={ style.volumeContainer }>
                                        <button className={ style.volumeButton }
                                            onMouseLeave={() => this.handleFastButtons('up')}
                                            onMouseUp={() => this.handleFastButtons('up')}
                                            onClick={() => this.handleFastButtons('click', 1)}
                                            onMouseDown={() => this.handleFastButtons('down', 1)}
                                            onTouchStart={() => this.handleFastButtons('down', 1)}
                                            onTouchEnd={() => this.handleFastButtons('up')}
                                        >
                                            <FontAwesomeIcon className={ style.volumeUp } icon={ faAngleUp } />
                                        </button>
                                        <div className={ style.volumeText }>{ this.props.Volume }</div>
                                        <button className={ style.volumeButton }
                                            onMouseLeave={() => this.handleFastButtons('up')}
                                            onMouseUp={() => this.handleFastButtons('up')}
                                            onClick={() => this.handleFastButtons('click', -1)}
                                            onMouseDown={() => this.handleFastButtons('down', -1)}
                                            onTouchStart={() => this.handleFastButtons('down', -1)}
                                            onTouchEnd={() => this.handleFastButtons('up')}
                                        >
                                            <FontAwesomeIcon className={ style.volumeDown } icon={ faAngleDown } />
                                        </button>
                                    </div>
                                    <button className={ style.controlsButton } onClick={ this.showVolume }>
                                        { this.props.Volume > 50 ?
                                            <FontAwesomeIcon icon={ faVolumeUp } /> :
                                            this.props.Volume !== 0 ?
                                            <FontAwesomeIcon icon={ faVolumeDown } /> :
                                            <FontAwesomeIcon icon={ faVolumeMute } />
                                        }
                                    </button>
                                    <button className={ style.controlsButton } onClick={ this.fullScreen }>
                                        { this.state.fullScreen === false ? 
                                            <FontAwesomeIcon icon={ faExpandArrowsAlt } /> :
                                            <FontAwesomeIcon icon={ faCompressArrowsAlt } />
                                        }
                                    </button>
                                </div>
                            ]
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    let ChosenVideos = state.ChosenVideos;
    let Volume = state.Volume;
    let VideoData = state.VideoData;
    return{ ChosenVideos, Volume, VideoData }
}
 
export default connect(mapStateToProps)(Player);
