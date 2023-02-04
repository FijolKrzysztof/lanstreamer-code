import React, { Component } from 'react';
import Video from './Video';
import style from './index.module.scss';
import { Action } from '../Store';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleLeft, faChevronCircleRight, faHome, faSortAmountDown, faCog } from '@fortawesome/fontawesome-free-solid';
import History from '../History';

class Videos extends Component {
    constructor(props){
        super(props);
        this.state = {
            videos: [],
            sortMenu: false,
            overSortMenu: false
        }
    }

    componentDidUpdate = (prevProps) => {
        if(this.props.ChosenVideos !== prevProps.ChosenVideos){
            this.playerCountAnimation();
        }
        if(this.props.VideoData.length === 0) document.getElementById('noVideos').style.display = 'block';
        else document.getElementById('noVideos').style.display = 'none';
    }

    componentDidMount = () => {
        this.props.dispatch(Action('CUSTOM SORT SHOW UPDATE', false));
        setTimeout(() => {
            for(let i = 0; i < this.props.PlayersNumber; i ++){
                this.addVideo()
            }
        })
    }

    addVideo = () => {
        const videos = this.state.videos;
        this.setState({ videos: videos.concat( <Video
            id={ videos.length }
            key={ videos.length }
        /> )})
    }

    changePage = (command) => {
        let currentPage = this.props.CurrentPage;
        let category = this.props.CategoryData;
        let playersNumber = parseInt(this.props.PlayersNumber);
        if(category){
            if(command === 'next' && currentPage + playersNumber < category.videos.length){
                this.props.dispatch(Action('CURRENT PAGE UPDATE', currentPage + playersNumber));
            }
            if(command === 'previous' && currentPage !== 0){
                this.props.dispatch(Action('CURRENT PAGE UPDATE', currentPage - playersNumber));
            }
        }
    }

    playerCountAnimation = () => {
        let playerCount = document.getElementById('playerCount');
        playerCount.style.animation = 'playerCountAnimation 1s';
        setTimeout(() => { playerCount.style.animation = '' }, 1000)
    }

    open = () => {
        History.push('/player');
    }

    home = () => {
        History.push('/');
    }

    displaySort = () => {
        this.setState({ sortMenu: true });
    }

    hideSort = () => {
        if(this.state.overSortMenu === false){
            this.setState({ sortMenu: false }) 
        }
    }

    overSortMenu = () => {
        this.setState({ overSortMenu: true })
    }

    leftSortMenu = () => {
        this.setState({ overSortMenu: false })
    }

    settings = () => {
        History.push('/settings')
    }

    overSortItem = (e) => {
        let element = e.target;
        let mousePos = e.clientX;
        let left = element.getBoundingClientRect().left;
        let right = element.getBoundingClientRect().right;
        let middle = (right - left) / 2 + left;
        if(mousePos < middle && element.style.paddingLeft !== '20px'){
            element.style.paddingRight = '0';
            element.style.borderRight = 'none';
            element.style.paddingLeft = '20px';
            element.style.borderLeft = '5px solid black';
        }
        if(mousePos >= middle && element.style.paddingRight !== '20px'){
            element.style.paddingLeft = '0';
            element.style.borderLeft = 'none';
            element.style.paddingRight = '20px';
            element.style.borderRight = '5px solid black';
        }
    }

    leftSortItem = (e) => {
        let element = e.target;
        element.style.padding = '0';
        element.style.border = 'none';
    }

    findWeights = () => {
        let views = this.props.CustomSort.views;
        let attention = this.props.CustomSort.attention;
        let date = this.props.CustomSort.date;
        let length = this.props.CustomSort.length;
        let rate = this.props.CustomSort.rating;
        let sum = views + attention + date + length + rate;
        views = Math.round(100 * views / sum);
        attention = Math.round(100 * attention / sum);
        date = Math.round(100 * date / sum);
        length = Math.round(100 * length / sum);
        rate = Math.round(100 * rate / sum);
        return { views: views, attention: attention, date: date, length: length, rate: rate };
    }

    findExtremes = () => {
        let VideoData = this.props.VideoData;
        let views = [];
        let attention = [];
        let date = [];
        let length = [];
        let rate = [];
        for(let i = 0; i < VideoData.length; i ++){
            views.push(VideoData[i].views);
        }
        for(let i = 0; i < VideoData.length; i ++){
            attention.push(VideoData[i].attention);
        }
        for(let i = 0; i < VideoData.length; i ++){
            date.push(VideoData[i].date);
        }
        for(let i = 0; i < VideoData.length; i ++){
            length.push(VideoData[i].length);
        }
        for(let i = 0; i < VideoData.length; i ++){
            rate.push(VideoData[i].rate);
        }
        return {
            views: { min: Math.min(...views), max: Math.max(...views) },
            attention: { min: Math.min(...attention), max: Math.max(...attention) },
            date: { min: Math.min(...date), max: Math.max(...date) },
            length: { min: Math.min(...length), max: Math.max(...length) },
            rate: { min: Math.min(...rate), max: Math.max(...rate) }
        }
    }

    countCustomValue = (video, weights, extremes) => {
        let views = (video.views - extremes.views.min) * 100 / (extremes.views.max - extremes.views.min);
        let attention = (video.attention - extremes.attention.min) * 100 / (extremes.attention.max - extremes.attention.min);
        let date = (video.date - extremes.date.min) * 100 / (extremes.date.max - extremes.date.min);
        let length = (video.length - extremes.length.min) * 100 / (extremes.length.max - extremes.length.min);
        let rate = (video.rate - extremes.rate.min) * 100 / (extremes.rate.max - extremes.rate.min);
        if(Number.isNaN(views)) views = 100;
        if(Number.isNaN(attention)) attention = 100;
        if(Number.isNaN(date)) date = 100;
        if(Number.isNaN(length)) length = 100;
        if(Number.isNaN(rate)) rate = 100;
        views = weights.views * views / 100;
        attention = weights.attention * attention / 100;
        date = weights.date * date / 100;
        length = weights.length * length / 100;
        rate = weights.rate * rate / 100;
        return views + attention + date + length + rate;
    }

    sort = (e, type) => {
        this.setState({ sortMenu: false })
        let categories = this.props.CategoryData;
        let values = [];
        let videos = this.props.VideoData;
        let sortType = 0;
        let weights;
        let extremes;
        if(type === 'Custom'){
            weights = this.findWeights();
            extremes = this.findExtremes();
            this.props.dispatch(Action('CUSTOM SORT SHOW UPDATE', true));
        }
        if(categories){
            categories.videos.forEach(id => {
                let video = videos[id];
                let value;
                switch(type){
                    case 'Custom':
                        value = this.countCustomValue(video, weights, extremes);
                        let videoData = this.props.VideoData[id];
                        videoData.custom = value;
                        this.props.dispatch(Action('VIDEO DATA UPDATE', videoData, id))
                    break;
                    case 'Name':
                        value = video.name;
                        sortType = 1;
                    break;
                    case 'Length':
                        value = video.length;
                    break;
                    case 'Date':
                        value = video.date;
                    break;
                    case 'Rating':
                        value = video.rate;
                    break;
                    case 'Views':
                        value = video.views;
                    break;
                    case 'Attention':
                        value = video.attention;
                    break;
                    case 'Random':
                        value = Math.floor(Math.random() * 100000);
                    break;
                    default: break;
                }
                values.push({ id: id, value: value });
            })
            let element = e.target;
            let mousePos = e.clientX;
            let left = element.getBoundingClientRect().left;
            let right = element.getBoundingClientRect().right;
            let middle = (right - left) / 2 + left;
            let sortStyle = null;
            if(mousePos < middle){
                sortStyle = 'Descending';
            } else {
                sortStyle = 'Ascending';
            }
            if(sortType === 0){
                values.sort(function(x,y){
                    if(sortStyle === 'Descending'){
                        return y.value - x.value;
                    } else {
                        return x.value - y.value;
                    }
                })
            } else {
                values.sort(function(x,y){
                    let xValue = x.value.toUpperCase();
                    let yValue = y.value.toUpperCase();
                    if(sortStyle === 'Descending'){
                        if(xValue < yValue){
                            return 1;
                        }
                        if(yValue < xValue){
                            return -1;
                        }
                    } else {
                        if(xValue < yValue){
                            return -1;
                        }
                        if(yValue < xValue){
                            return 1;
                        }
                    }
                    return 0;
                })
            }
            let sort = [];
            values.forEach(value => {
                sort.push(value.id);
            })
            categories.videos = sort;
            this.props.dispatch(Action('CATEGORY DATA UPDATE', categories, this.props.CurrentCategory));
        }
    }

    changePoster = (action) => {
        if(action === 'yes'){
            let value = document.getElementById('confirmAlert').value;
            this.props.dispatch(Action('POSTER CHANGE', value ));
        } else {
            this.props.dispatch(Action('POSTER CHANGE', null));
        }
        document.getElementById('confirmAlert').style.animation = 'confirmAlert 0.5s reverse';
        setTimeout(() => {
            document.getElementById('confirmAlert').style.transform = 'scale(0)';
            document.getElementById('confirmAlert').style.animation = '';
        }, 450)
    }

    render(){
        return(
            <div>
                <div id='noVideos'>NO VIDEOS</div>
                <div id='confirmAlert' className={ style.confirmAlert }>
                    <div className={ style.confirmTitle }>Are you sure you want to change the poster?</div>
                    <div className={ style.confirmAlertContainer }>
                        <button className={ style.confirmButton } onClick={() => this.changePoster('yes')}>Yes</button>
                        <button className={ style.confirmButton } onClick={() => this.changePoster('no')}>Cancel</button>
                    </div>
                </div>
                <div id={ 'menu' } className={ style.menu }>
                    <button className={ style.homeButton } onClick={ this.home }>
                        <FontAwesomeIcon icon={ faHome } />
                    </button>
                    <div className={ style.playerContainer } onClick={ this.open }>
                        <div className={ style.playerName }>Player</div>
                        <div id={ 'playerCount' } className={ style.playerCount}>{ this.props.ChosenVideos }</div>
                        <div className={ style.playerLine }></div>
                    </div>
                    <button className={ style.settingsButton } onClick={ this.settings }>
                        <FontAwesomeIcon icon={ faCog } />
                    </button>
                    <button className={ style.sortButton } onFocus={ this.displaySort } onBlur={ this.hideSort }>
                        <FontAwesomeIcon icon={ faSortAmountDown } />
                    </button>
                    { this.state.sortMenu === true ?
                        <div className={ style.sortMenu } onMouseEnter={ this.overSortMenu } onMouseLeave={ this.leftSortMenu }>
                            <button className={ style.sortItem }
                                onMouseMove={(e) => this.overSortItem(e)}
                                onMouseLeave={(e) => this.leftSortItem(e)}
                                onClick={(e) => this.sort(e, 'Attention')}
                            >Attention</button>
                            <button className={ style.sortItem }
                                onMouseMove={(e) => this.overSortItem(e)}
                                onMouseLeave={(e) => this.leftSortItem(e)}
                                onClick={(e) => this.sort(e, 'Custom')}
                            >Custom</button>
                            <button className={ style.sortItem }
                                onMouseMove={(e) => this.overSortItem(e)}
                                onMouseLeave={(e) => this.leftSortItem(e)}
                                onClick={(e) => this.sort(e, 'Date')}
                            >Date</button>
                            <button className={ style.sortItem }
                                onMouseMove={(e) => this.overSortItem(e)}
                                onMouseLeave={(e) => this.leftSortItem(e)}
                                onClick={(e) => this.sort(e, 'Length')}
                            >Length</button>
                            <button className={ style.sortItem }
                                onMouseMove={(e) => this.overSortItem(e)}
                                onMouseLeave={(e) => this.leftSortItem(e)}
                                onClick={(e) => this.sort(e, 'Name')}
                            >Name</button>
                            <button className={ style.sortItem }
                                onMouseMove={(e) => this.overSortItem(e)}
                                onMouseLeave={(e) => this.leftSortItem(e)}
                                onClick={(e) => this.sort(e, 'Random')}
                            >Random</button>
                            <button className={ style.sortItem }
                                onMouseMove={(e) => this.overSortItem(e)}
                                onMouseLeave={(e) => this.leftSortItem(e)}
                                onClick={(e) => this.sort(e, 'Rating')}
                            >Rating</button>
                            <button className={ style.sortItem }
                                onMouseMove={(e) => this.overSortItem(e)}
                                onMouseLeave={(e) => this.leftSortItem(e)}
                                onClick={(e) => this.sort(e, 'Views')}
                            >Views</button>
                        </div> :
                        null
                    }
                    <div className={ style.pageChange }>
                        <button className={ style.pageButton } onClick={() => this.changePage('previous')}>
                            <FontAwesomeIcon icon={ faChevronCircleLeft } />
                        </button>
                        <div className={ style.pageCount }>{ this.props.CurrentPage / this.props.PlayersNumber + 1 }</div>
                        <button className={ style.pageButton } onClick={() => this.changePage('next')}>
                            <FontAwesomeIcon icon={ faChevronCircleRight } />
                        </button>
                    </div>
                </div>
                <div className={ style.videoContainer }>
                    { this.state.videos }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    let PlayersNumber = state.PlayersNumber;
    let CurrentPage = state.CurrentPage;
    let CurrentCategory = state.CurrentCategory;
    let CategoryData = state.CategoryData[CurrentCategory];
    let ChosenVideos = state.ChosenVideos.length;
    let VideoData = state.VideoData;
    let CustomSort = state.CustomSort;
    return{ CurrentPage, CategoryData, ChosenVideos, PlayersNumber, VideoData, CustomSort }
}
 
export default connect(mapStateToProps)(Videos);