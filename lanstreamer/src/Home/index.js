import React, {Component} from 'react';
import style from './index.module.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faFilm, faVideo} from '@fortawesome/fontawesome-free-solid';
import History from '../History';
import axios from 'axios';
import {Action} from '../Store';
import {connect} from 'react-redux';
import cookie from 'js-cookie';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: null,
            loggedIn: false,
        }
    }

    clearRedux = () => {
        this.props.dispatch(Action('CHOSEN VIDEOS CLEAR'));
        this.props.dispatch(Action('CURRENT CATEGORY UPDATE', 0));
        this.props.dispatch(Action('CURRENT PAGE UPDATE', 0));
    }

    about = () => {
        window.open(window.whatIsLanstreamer, '_blank');
    }

    checkConnection = () => {
        if (window.demo === false) {
            this.clearRedux();
            let address = window.localhost;
            axios.post(address + 'checkConnection')
                .then((message) => {
                    let password = message.data.password;
                    if (password === null) {
                        this.getStarted();
                    } else {
                        this.setState({password: password}, () => {
                            document.getElementById('passwordContainer').style.bottom = 0;
                        })
                    }
                })
                .catch(() => {
                    document.getElementById('download').scrollIntoView({behavior: 'smooth', block: 'center'});
                })
        } else {
            document.getElementById('download').scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }

    getStarted = () => {
        let address = window.localhost;
        let playersNumber = cookie.get('playersNumber');
        let previewParts = cookie.get('previewParts');
        let previewClipDuration = cookie.get('previewClipDuration')
        if (playersNumber !== undefined) this.props.dispatch(Action('PLAYERS NUMBER UPDATE', parseInt(playersNumber)));
        if (previewParts !== undefined) window.previewParts = previewParts;
        if (previewClipDuration !== undefined) window.previewClipDuration = previewClipDuration;
        History.push('/videos');
        this.props.getVideos(address);
    }

    confirmPassword = (e) => {
        if (e.key === 'Enter') {
            this.checkPassword();
        }
    }

    checkPassword = () => {
        document.getElementById('passwordContainer').style.bottom = '-65px'
        let password = document.getElementById('password').value;
        if (password === this.state.password) {
            setTimeout(() => {
                this.getStarted();
            }, 500)
        } else {
            document.getElementById('warningAlert').style.left = '0px';
            document.getElementById('alertText').innerText = 'WRONG PASSWORD';
            document.getElementById('password').value = '';
        }
    }

    render() {
        return (
            <div>
                <div className={style.passwordContainer} id='passwordContainer'>
                    <input className={style.passwordInput} type='password' id='password'
                           onKeyDown={(e) => this.confirmPassword(e)}/>
                    <div className={style.passwordText}>Password</div>
                    <FontAwesomeIcon className={style.confirm} icon={faCheck} onClick={this.checkPassword}/>
                </div>
                {window.developmentMode === true ?
                    <div className={style.developmentMode}>Development Mode</div> :
                    null
                }
                <div className={style.background}>
                    <div className={style.imageContainer}>
                        <FontAwesomeIcon className={style.image} icon={faFilm}/>
                        <FontAwesomeIcon className={style.image} icon={faVideo}/>
                    </div>
                    <div className={style.text}>Sort, preview and play your offline videos</div>
                    <div className={style.buttonContainer}>
                        <button className={style.button} onClick={this.about}>ABOUT</button>
                        <div className={style.margin}></div>
                        <button className={style.button}
                                onClick={this.checkConnection}>{'GET STARTED'}</button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = () => {
    return {};
}

export default connect(mapStateToProps)(Home);
