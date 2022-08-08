import React, { Component } from 'react';
import style from './index.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faVideo, faCheck } from '@fortawesome/free-solid-svg-icons';
import History from '../History';
import axios from 'axios';
import { Action } from '../Store';
import { connect } from 'react-redux';
import cookie from 'js-cookie';

let loginLink = window.demo === true ? '/login/' : 'https://lanstreamer.com/login/';

let demo = `\
The demo version allows you to test the basic functionality of the program with some 
limitations of functions available only after downloading the program to your computer.`;
let getStarted1 = `\
To start using the program, go `;
let getStarted2 = `\
, then register ( the program will not work without registration ) and download the program 
to your computer. After unpacking, find the executable file for your operating system and run the program.`;
let about = `\
The application allows you to play local media files offline, as well as stream movies to other devices 
connected to the local network. In the program, you can preview random frames from the movie before watching, 
and also arrange movies based on: number of views, attention, rating, length, date of adding the movie, name and more.`;

class Home extends Component {
    constructor(props){
        super(props);
        this.state = { password: null }
    }

    clearRedux = () => {
        this.props.dispatch(Action('CHOSEN VIDEOS CLEAR'));
        this.props.dispatch(Action('CURRENT CATEGORY UPDATE', 0));
        this.props.dispatch(Action('CURRENT PAGE UPDATE', 0));
    }

    demo = () => {
        this.clearRedux();
        if(window.demo === true){
            let address = window.server;
            this.props.dispatch(Action('PLAYERS NUMBER UPDATE', 3));
            window.previewParts = 1;
            window.previewClipDuration = 20;
            History.push('/videos');
            this.props.getVideos(address);
        } else {
            document.getElementById('demo').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    checkConnection = () => {
        if(window.demo === false){
            this.clearRedux();
            let address = window.localhost;
            axios.post(address + 'checkConnection')
            .then((message) => {
                let password = message.data.password;
                if(password === null){
                    this.getStarted();
                } else {
                    this.setState({ password: password }, () => {
                        document.getElementById('passwordContainer').style.bottom = 0;
                    })
                }
            })
            .catch(() => {
                document.getElementById('getStarted').scrollIntoView({ behavior: 'smooth', block: 'center' });
            })
        } else {
            document.getElementById('getStarted').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    getStarted = () => {
        let address = window.localhost;
        let playersNumber = cookie.get('playersNumber');
        let previewParts = cookie.get('previewParts');
        let previewClipDuration = cookie.get('previewClipDuration')
        if(playersNumber !== undefined) this.props.dispatch(Action('PLAYERS NUMBER UPDATE', parseInt(playersNumber)));
        if(previewParts !== undefined) window.previewParts = previewParts;
        if(previewClipDuration !== undefined) window.previewClipDuration = previewClipDuration;
        History.push('/videos');
        this.props.getVideos(address);
    }

    confirmPassword = (e) => {
        if(e.key === 'Enter'){
            this.checkPassword();
        }
    }

    checkPassword = () => {
        document.getElementById('passwordContainer').style.bottom = '-65px'
        let password = document.getElementById('password').value;
        if(password === this.state.password){
            setTimeout(() => {
                this.getStarted();
            }, 500)
        } else {
            document.getElementById('warningAlert').style.left = '0px';
            document.getElementById('alertText').innerText = 'WRONG PASSWORD';
            document.getElementById('password').value = '';
        }
    }

    render(){
        return(
            <div>
                <div className={ style.passwordContainer } id='passwordContainer'>
                    <input className={ style.passwordInput } type='password' id='password' onKeyDown={(e) => this.confirmPassword(e)} />
                    <div className={ style.passwordText }>Password</div>
                    <FontAwesomeIcon className={ style.confirm } icon={ faCheck } onClick={ this.checkPassword } />
                </div>
                { window.developmentMode === true ?
                    <div className={ style.developmentMode }>Development Mode</div> :
                    null
                }
                <div className={ style.background }>
                    <div className={ style.imageContainer }>
                        <FontAwesomeIcon className={ style.image } icon={ faFilm } />
                        <FontAwesomeIcon className={ style.image } icon={ faVideo } />
                    </div>
                    <div className={ style.text }>Sort, preview and play your offline videos</div>
                    <div className={ style.buttonContainer }>
                        <button className={ style.button } onClick={ this.demo }>DEMO</button>
                        <div className={ style.margin }></div>
                        <button className={ style.button } onClick={ this.checkConnection }>{ window.demo ? 'DOWNLOAD' : 'GET STARTED' }</button>
                    </div>
                </div>
                <div className={ style.textArea }>
                    <div id='demo' className={ style.textContainer }>
                        <div className={ style.header }>DEMO</div>
                        <p className={ style.infoText }>{ demo }</p>
                    </div>
                    <div id='getStarted' className={ style.textContainer }>
                        <div className={ style.header }>{ window.demo ? <a href={ loginLink } className={ style.headerLink }>DOWNLOAD</a> : 'GET STARTED'}</div>
                        <p className={ style.infoText }>{ getStarted1 }<a href={ loginLink } style={{ color: 'red' }}>here</a>{ getStarted2 }</p>
                    </div>
                    <div className={ style.textContainer }>
                        <div className={ style.header }>ABOUT</div>
                        <p className={ style.infoText }>{ about }</p>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = () => {
    return{};
}

export default connect(mapStateToProps)(Home);
