import axios from 'axios';
import React, {Component} from 'react';
import {Action} from '../Store';
import {connect} from 'react-redux';
import style from './Video.module.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChartBar, faPen, faStar} from '@fortawesome/free-solid-svg-icons';

class Video extends Component {
    constructor(props) {
        super(props);
        this.state = {
            preview: false,
            breakNum: 0,
            stats: false,
            rename: false,
            rate: false,
            overRate: false,
            mouseDownCount: null,
        }
    }

    componentDidMount = () => {
        if (this.props.VideoData !== null) {
            this.setPoster();
        }
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.VideoData !== null) {
            if (this.props.VideoData !== prevProps.VideoData) {
                this.setPoster();
                if (this.state.rename === true) {
                    this.showHideRename();
                }
            }
            if (this.props.PosterChange === this.props.id) {
                this.changePoster();
            }
        }
    }

    componentWillUnmount() {
        this.setState({ preview: false, previewActive: false })
    }

    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    setPoster = () => {
        document.getElementById('video' + this.props.id).setAttribute('poster', null);
        setTimeout(() => {
            let name = this.props.VideoData.name;
            let link = (window.demo ? window.server + 'demo/' : window.webAddress) + 'poster/' + name;
            document.getElementById('video' + this.props.id).setAttribute('poster', link);
        })
    }

    preChangePoster = () => {
        if (new Date().getTime() - window.posterChangeTimeout < 10000) {
            this.changePoster();
        } else {
            document.getElementById('confirmAlert').style.animation = 'confirmAlert 0.5s forwards';
            document.getElementById('confirmAlert').value = this.props.id;
            setTimeout(() => {
                document.getElementById('confirmAlert').style.transform = 'scale(1)';
                document.getElementById('confirmAlert').style.animation = '';
            }, 450)
        }
    }

    changePoster = () => {
        this.props.dispatch(Action('POSTER CHANGE', null));
        if (window.demo === false) {
            window.posterChangeTimeout = new Date().getTime();
            let loading = document.getElementById('loading' + this.props.id);
            loading.style.display = 'block';
            let name = this.props.VideoData.name;
            let player = document.getElementById('video' + this.props.id);
            axios.get(window.webAddress + 'changePoster/' + name)
                .then(() => {
                    let link = window.webAddress + 'changePoster/' + name;
                    player.setAttribute('poster', link);
                    let image = new Image();
                    image.onload = function () {
                        loading.style.display = 'none';
                    };
                    image.src = link;
                })
                .catch(() => loading.style.display = 'none')
        } else {
            document.getElementById('warningAlert').style.left = 0;
            document.getElementById('alertText').innerText = 'NOT AVAILABLE IN DEMO VERSION';
        }
    }

    setVideo = () => {
        let link = (window.demo ? window.server + 'demo/' : window.webAddress) + 'video/' + this.props.VideoData.name;
        document.getElementById('video' + this.props.id).setAttribute('src', link);
    }

    createPreview = (count, clipTime) => {
        return new Promise((resolve) => {
            let player = document.getElementById('video' + this.props.id);
            if (player !== null && player['readyState'] !== undefined && this.state.preview === true) {
                if (player.readyState === 4) {
                    let part = player.duration / count;
                    let parts = [];
                    if (count === 1) {
                        parts.push(0);
                    } else {
                        for (let i = 0; i < count; i++) {
                            parts.push(this.getRandom(i * part, (i + 1) * part - clipTime))
                        }
                    }
                    resolve(parts);
                } else {
                    setTimeout(() => {
                        resolve(this.createPreview(count, clipTime));
                    }, 100)
                }
            }
        })
    }

    hideLoading = () => {
        let player = document.getElementById('video' + this.props.id);
        if (!player.paused) {
            document.getElementById('loading' + this.props.id).style.display = 'none';
        } else if (this.state.preview === true) {
            setTimeout(() => {
                this.hideLoading();
            }, 100)
        }
    }

    previewActive = false;

    preview = (count, parts, clipTime, breakNum) => {
        if (this.state.preview === true && this.previewActive === false) {
            this.previewActive = true;
            let player = document.getElementById('video' + this.props.id);
            let loading = document.getElementById('loading' + this.props.id);
            if (count < parts.length) {
                if (player.readyState === 4) {
                    player.play();
                    player.currentTime = parts[count];
                    setTimeout(() => {
                        if (this.state.breakNum === breakNum) this.previewActive = false;
                        this.preview(count += 1, parts, clipTime, breakNum)
                    }, clipTime * 1000)
                    this.hideLoading();
                } else {
                    loading.style.display = 'block';
                    setTimeout(() => {
                        if (this.state.breakNum === breakNum) this.previewActive = false;
                        this.preview(count, parts, clipTime, breakNum);
                    }, 100)
                }
            } else {
                if (this.state.breakNum === breakNum) this.previewActive = false;
                this.preview(0, parts, clipTime, breakNum)
            }
        }
    }

    prePreview = (command) => {
        let player = document.getElementById('video' + this.props.id);
        let loading = document.getElementById('loading' + this.props.id);
        if (command === 'start') {
            this.setVideo();
            this.setState({ preview: true }, async () => {
                this.previewActive = false;
                loading.style.display = 'block';
                let parts = await this.createPreview(window.previewParts, window.previewClipDuration)
                this.preview(0, parts, window.previewClipDuration, this.state.breakNum)
            });
        }
        if (command === 'stop') {
            document.getElementById('video' + this.props.id).removeAttribute('src');
            document.getElementById('video' + this.props.id).load();
            this.setState({ preview: false, breakNum: this.state.breakNum += 1 }, () => {
                player.pause();
                loading.style.display = 'none';
            });
        }
    }

    videoMouseDownEvent = () => {
        this.setState({ mouseDownCount: new Date() });
        setTimeout(() => {
            if (!this.state.preview) {
                this.prePreview('start');
            }
        })
    }

    videoMouseUpEvent = () => {
        if (new Date().getTime() - this.state.mouseDownCount.getTime() < 500) {
            this.chooseVideo();
        }
    }

    chooseVideo = () => {
        let chosenVideos = this.props.ChosenVideos;
        let name = this.props.VideoData.name;
        let index = this.props.Index;
        let videoData = this.props.VideoData;
        if (chosenVideos.includes(name) === false) {
            videoData.views++;
            this.props.dispatch(Action('CHOSEN VIDEOS ADD', name));
            this.props.dispatch(Action('VIDEO DATA UPDATE', videoData, index))
            if (window.demo === false && window.developmentMode === false) {
                axios.post(window.webAddress + 'videoUpdate', { name: name, itemName: 'views', data: videoData.views })
            }
        }
    }

    showStats = () => {
        this.setState({ stats: true });
    }

    hideStats = () => {
        this.setState({ stats: false });
    }

    showHideRename = () => {
        let button = document.getElementById('renameButton' + this.props.id);
        if (this.state.rename === false) {
            button.style.transform = 'rotate(90deg)';
            setTimeout(() => {
                button.style = style.renameButtonAfter;
                button.className = style.renameButtonAfter;
            }, 500)
            this.setState({ rename: true }, () => {
                let input = document.getElementById('rename' + this.props.id);
                input.value = this.props.VideoData.name.slice(0, -4);
                input.focus();
            });
        } else {
            button.style.transform = 'rotate(0deg)';
            setTimeout(() => {
                button.style = style.renameButtonBefore;
                button.className = style.renameButtonBefore;
            }, 500)
            this.setState({ rename: false });
        }
    }

    rename = (e) => {
        if (e.key === 'Enter') {
            let prevName = this.props.VideoData.name;
            let name = document.getElementById('rename' + this.props.id).value;
            let extension = prevName.slice(prevName.length - 4);
            if (window.demo === false) {
                axios.post(window.webAddress + 'rename', { prevName: prevName, name: name, extension: extension })
                    .then((message) => {
                        if (message.data === 'SUCCESS') {
                            let index = this.props.Index;
                            let videoData = this.props.VideoData;
                            videoData.name = name + extension;
                            this.props.dispatch(Action('VIDEO DATA UPDATE', videoData, index));
                            this.props.dispatch(Action('CHOSEN VIDEOS CLEAR'));
                            this.showHideRename();
                        } else {
                            document.getElementById('warningAlert').style.left = 0;
                            document.getElementById('alertText').innerText = message.data;
                        }
                    })
            } else {
                document.getElementById('warningAlert').style.left = 0;
                document.getElementById('alertText').innerText = 'NOT AVAILABLE IN DEMO VERSION';
            }
        }
    }

    convertTime = (seconds) => {
        let hour = Math.floor(Math.floor(seconds / 60) / 60);
        let minute = Math.floor(seconds / 60) - hour * 60;
        let second = Math.round(seconds - (minute * 60 + hour * 60 * 60));
        return `${hour === 0 ? '' : hour + ':'}${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`;
    }

    convertDate = (input) => {
        let date = new Date(input);
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        return day + '.' + (month > 8 ? month + 1 : '0' + (month + 1)) + '.' + year;
    }

    convertAttention = (seconds) => {
        let hour = Math.floor(Math.floor(seconds / 60) / 60);
        let minute = Math.floor(seconds / 60) - hour * 60;
        let second = Math.round(seconds - (minute * 60 + hour * 60 * 60));
        if (hour === 0) {
            if (minute === 0) {
                return second + ' sec';
            } else {
                return minute + '.' + ((second / 60).toFixed(1)).slice(-1) + ' min';
            }
        } else {
            return hour + '.' + ((minute / 60).toFixed(1)).slice(-1) + ' hr';
        }
    }

    updateRate = (caller) => {
        let VideoData = this.props.VideoData;
        VideoData.rate = caller;
        let index = this.props.Index;
        this.props.dispatch(Action('VIDEO UPDATE', VideoData, index));
        if (window.demo === false && window.developmentMode === false) {
            axios.post(window.webAddress + 'videoUpdate', { name: VideoData.name, itemName: 'rate', data: caller })
        }
    }

    rate = (caller) => {
        let star1 = document.getElementById(this.props.id + '_star1');
        let star2 = document.getElementById(this.props.id + '_star2');
        let star3 = document.getElementById(this.props.id + '_star3');
        let star4 = document.getElementById(this.props.id + '_star4');
        let star5 = document.getElementById(this.props.id + '_star5');
        if (caller > 0) star1.style.color = 'goldenrod';
        else star1.style.color = 'black';
        if (caller > 1) star2.style.color = 'goldenrod';
        else star2.style.color = 'black';
        if (caller > 2) star3.style.color = 'goldenrod';
        else star3.style.color = 'black';
        if (caller > 3) star4.style.color = 'goldenrod';
        else star4.style.color = 'black';
        if (caller > 4) star5.style.color = 'goldenrod';
        else star5.style.color = 'black';
    }

    showRate = () => {
        this.setState({ rate: true }, () => {
            this.rate(this.props.VideoData.rate);
        });
    }

    hideRate = () => {
        if (this.state.overRate === false) {
            this.setState({ rate: false })
        }
    }

    overRate = () => {
        this.setState({ overRate: true })
    }

    leftRate = () => {
        this.rate(this.props.VideoData.rate);
        this.setState({ overRate: false });
    }

    render() {
        if (this.props.VideoData === null) {
            return null;
        } else {
            return (
                <div className={style.video}>
                    <div className={style.videoContainer} onMouseDown={() => this.videoMouseDownEvent()}
                         onMouseUp={() => this.videoMouseUpEvent()}>
                        <video className={style.player} id={'video' + this.props.id} muted
                               onMouseEnter={() => this.prePreview('start')}
                               onMouseOut={() => this.prePreview('stop')}
                        />
                        <div id={'loading' + this.props.id} className={style.loading}>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                        <div className={style.length}>{this.convertTime(this.props.VideoData.length)}</div>
                    </div>
                    <div className={style.container}>
                        {this.state.rename === false ?
                            <div className={style.name}>{this.props.VideoData.name.slice(0, -4)}</div> :
                            <input className={style.rename} id={'rename' + this.props.id}
                                   onKeyUp={(e) => this.rename(e)}/>
                        }
                        <div className={style.buttonsContainer}>
                            <button className={style.poster} onClick={this.preChangePoster}>Change Poster</button>
                            <div className={style.faButtonsContainer}>
                                <button className={style.renameButtonBefore} id={'renameButton' + this.props.id}
                                        onClick={this.showHideRename}>
                                    <FontAwesomeIcon icon={faPen} style={{ pointerEvents: 'none' }}/>
                                </button>
                                <button className={style.rateButton} onFocus={this.showRate} onBlur={this.hideRate}>
                                    <FontAwesomeIcon icon={faStar}/>
                                </button>
                                <button className={style.statsButton} onFocus={this.showStats} onBlur={this.hideStats}>
                                    <FontAwesomeIcon icon={faChartBar}/>
                                </button>
                            </div>
                        </div>
                    </div>
                    {this.state.rate === true ?
                        <div className={style.rateContainer} onMouseEnter={this.overRate} onMouseLeave={this.leftRate}
                             onBlur={this.hideRate}>
                            <button className={style.starButton} id={this.props.id + '_star1'}
                                    onClick={() => this.updateRate(1)}
                                    onMouseOver={() => this.rate(1)}
                            >
                                <FontAwesomeIcon icon={faStar} style={{ pointerEvents: 'none' }}/>
                            </button>
                            <button className={style.starButton} id={this.props.id + '_star2'}
                                    onClick={() => this.updateRate(2)}
                                    onMouseOver={() => this.rate(2)}
                            >
                                <FontAwesomeIcon icon={faStar} style={{ pointerEvents: 'none' }}/>
                            </button>
                            <button className={style.starButton} id={this.props.id + '_star3'}
                                    onClick={() => this.updateRate(3)}
                                    onMouseOver={() => this.rate(3)}
                            >
                                <FontAwesomeIcon icon={faStar} style={{ pointerEvents: 'none' }}/>
                            </button>
                            <button className={style.starButton} id={this.props.id + '_star4'}
                                    onClick={() => this.updateRate(4)}
                                    onMouseOver={() => this.rate(4)}
                            >
                                <FontAwesomeIcon icon={faStar} style={{ pointerEvents: 'none' }}/>
                            </button>
                            <button className={style.starButton} id={this.props.id + '_star5'}
                                    onClick={() => this.updateRate(5)}
                                    onMouseOver={() => this.rate(5)}
                            >
                                <FontAwesomeIcon icon={faStar} style={{ pointerEvents: 'none' }}/>
                            </button>
                        </div> : null
                    }
                    {this.state.stats === true ?
                        <div className={style.statsContainer}>
                            {this.props.CustomSortShow === true ?
                                <div className={style.statsItemContainer}>
                                    <div className={style.statsItemHeader}>{'Custom:'}</div>
                                    <div
                                        className={style.statsItemValue}>{Math.round(this.props.VideoData.custom) + '%'}</div>
                                </div> : null
                            }
                            <div className={style.statsItemContainer}>
                                <div className={style.statsItemHeader}>{'Date:'}</div>
                                <div
                                    className={style.statsItemValue}>{this.convertDate(this.props.VideoData.date)}</div>
                            </div>
                            <div className={style.statsItemContainer}>
                                <div className={style.statsItemHeader}>{'Attention:'}</div>
                                <div
                                    className={style.statsItemValue}>{this.convertAttention(this.props.VideoData.attention)}</div>
                            </div>
                            <div className={style.statsItemContainer}>
                                <div className={style.statsItemHeader}>{'Views:'}</div>
                                <div className={style.statsItemValue}>{this.props.VideoData.views}</div>
                            </div>
                        </div> : null
                    }
                </div>
            );
        }
    }
}

const mapStateToProps = (state, props) => {
    let PosterChange = state.PosterChange;
    let CurrentCategory = state.CurrentCategory;
    let CurrentPage = state.CurrentPage;
    let CategoryData = state.CategoryData.length > CurrentCategory ? state.CategoryData[CurrentCategory] : null;
    let VideoData = state.VideoData;
    let ChosenVideos = state.ChosenVideos;
    let Index = null;
    let CustomSortShow = state.CustomSortShow;
    if (CategoryData === null) {
        VideoData = null;
    } else {
        if (CategoryData.videos.length > props.id + CurrentPage) {
            Index = CategoryData.videos[props.id + CurrentPage];
            VideoData = VideoData[Index];
        } else {
            VideoData = null;
        }
    }
    return { PosterChange, CategoryData, VideoData, ChosenVideos, CurrentPage, Index, CustomSortShow }
}

export default connect(mapStateToProps)(Video);
