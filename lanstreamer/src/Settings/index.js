import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointLeft } from '@fortawesome/free-solid-svg-icons';
import style from './index.module.scss';
import History from '../History';
import { connect } from 'react-redux';
import { Action } from '../Store';
import cookie from 'js-cookie';

let playersNumberMin = 1;
let playersNumberMax = 20;
let previewPartsMin = 1;
let previewPartsMax = 10;
let previewClipDurationMin = 0.5;
let previewClipDurationMax = 9.5;

class Settings extends Component {
    constructor(props){
        super(props);
        this.state = {
            playersNumber: 0,
            previewParts: 0,
            previewClipDuration: 0
        }
    }

    componentDidMount = () => {
        setTimeout(() => {
            this.setCustomSort();
            this.playersNumber(this.props.PlayersNumber);
            this.previewParts(window.previewParts);
            this.previewClipDuration(window.previewClipDuration);
            document.getElementById('playersNumberInput').value = this.props.PlayersNumber;
            document.getElementById('previewPartsInput').value = window.previewParts;
            document.getElementById('previewClipDurationInput').value = window.previewClipDuration;
        })
    }

    setCustomSort = () => {
        let customSort = this.props.CustomSort;
        document.getElementById('customSortViews').value = customSort.views;
        document.getElementById('customSortAttention').value = customSort.attention;
        document.getElementById('customSortDate').value = customSort.date;
        document.getElementById('customSortLength').value = customSort.length;
        document.getElementById('customSortRating').value = customSort.rating;
    }

    goBack = () => {
        History.push('/videos');
    }

    prePlayersNumber = (num) => {
        cookie.set('playersNumber', num, { expires: 100 });
        this.playersNumber(num);
    }

    prePreviewParts = (num) => {
        if(window.demo === true){
            document.getElementById('warningAlert').style.left = '0px';
            document.getElementById('alertText').innerText = 'NOT AVAILABLE IN DEMO VERSION';
        } else {
            cookie.set('previewParts', num, { expires: 100 });
            this.previewParts(num);
        }
    }

    prePreviewClipDuration = (num) => {
        if(window.demo === true){
            document.getElementById('warningAlert').style.left = '0px';
            document.getElementById('alertText').innerText = 'NOT AVAILABLE IN DEMO VERSION';
        } else {
            cookie.set('previewClipDuration', num, { expires: 100 });
            this.previewClipDuration(num);
        }
    }

    playersNumber = (num) => {
        num = parseInt(num);
        this.props.dispatch(Action('PLAYERS NUMBER UPDATE', num))
        this.props.dispatch(Action('CURRENT PAGE UPDATE', 0))
        this.setState({ playersNumber: num })
        let difference = playersNumberMax - playersNumberMin;
        let percent = ((num - playersNumberMin) / difference * 100).toFixed(0);
        document.getElementById('playersNumberInput').style.background = `linear-gradient(90deg, rgb(104, 130, 177) ${percent}%, rgb(204, 204, 204) ${percent}%)`;
    }

    previewParts = (num) => {
        num = parseInt(num);
        window.previewParts = num;
        this.setState({ previewParts: num })
        let difference = previewPartsMax - previewPartsMin;
        let percent = ((num - previewPartsMin) / difference * 100).toFixed(0);
        document.getElementById('previewPartsInput').style.background = `linear-gradient(90deg, rgb(104, 130, 177) ${percent}%, rgb(204, 204, 204) ${percent}%)`;
    }

    previewClipDuration = (num) => {
        num = parseFloat(num);
        window.previewClipDuration = num;
        this.setState({ previewClipDuration: Number.isInteger(num) ? num + '.0' : num })
        let difference = previewClipDurationMax - previewClipDurationMin;
        let percent = ((num - previewClipDurationMin) / difference * 100).toFixed(0)
        document.getElementById('previewClipDurationInput').style.background = `linear-gradient(90deg, rgb(104, 130, 177) ${percent}%, rgb(204, 204, 204) ${percent}%)`;
    }

    customSortUpdate = (e) => {
        let value = e.target.valueAsNumber;
        let name = e.target.id;
        let input = document.getElementById(name);
        if(Number.isNaN(value)) input.value = 0;
        else if(!Number.isInteger(value)) input.value = value.toFixed(0);
        else if(value < 0) input.value = 0;
        else if(value > 100) input.value = 100;
        else {
            input.value = value;
            let customSort = this.props.CustomSort;
            if(name === 'customSortViews') customSort.views = value;
            if(name === 'customSortAttention') customSort.attention = value;
            if(name === 'customSortDate') customSort.date = value;
            if(name === 'customSortLength') customSort.length = value;
            if(name === 'customSortRating') customSort.rating = value;
            cookie.set('customSort', JSON.stringify(customSort), { expires: 100 });
            this.props.dispatch(Action('CUSTOM SORT UPDATE', customSort));
        }
    }

    render(){
        return(
            <div className={ style.settings }>
                <button className={ style.backButton } onClick={ this.goBack }>
                    <FontAwesomeIcon icon={ faHandPointLeft } />
                </button>
                <div className={ style.mainContainer }>
                    <div className={ style.settingsContainer }>
                        <div className={ style.elementContainer }>
                            <div className={ style.name }>Players Number</div>
                            <div className={ style.inputContainer }>
                                <div className={ style.num }>{ this.state.playersNumber }</div>
                                <input id='playersNumberInput' className={ style.slider } type='range'
                                min={ playersNumberMin }
                                max={ playersNumberMax }
                                onChange={(e) => this.prePlayersNumber(e.target.value)} />
                            </div>
                        </div>
                        <div className={ style.elementContainer }>
                            <div className={ style.name }>Preview Parts</div>
                            <div className={ style.inputContainer }>
                                <div className={ style.num }>{ this.state.previewParts }</div>
                                <input id='previewPartsInput' className={ style.slider } type='range' 
                                    min={ previewPartsMin } 
                                    max={ previewPartsMax } 
                                    onChange={(e) => this.prePreviewParts(e.target.value)} />
                            </div>
                        </div>
                        <div className={ style.elementContainer }>
                            <div className={ style.name }>Preview Clip Duration</div>
                            <div className={ style.inputContainer }>
                                <div className={ style.num }>{ this.state.previewClipDuration }</div>
                                <input id='previewClipDurationInput' className={ style.slider } type='range'
                                    step='0.5'
                                    min={ previewClipDurationMin }
                                    max={ previewClipDurationMax }
                                    onChange={(e) => this.prePreviewClipDuration(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className={ style.customContainer }>
                        <div className={ style.customTitle }>Custom Sort</div>
                        <div className={ style.customInputContainer }>
                            <div className={ style.customItemContainer }>
                                <input className={ style.customItemInput } type='number' placeholder='0'
                                    onChange={(e) => this.customSortUpdate(e)}
                                    id='customSortViews'
                                />
                                <div className={ style.customItemTitle }>Views</div>
                            </div>
                            <div className={ style.customItemContainer }>
                                <input className={ style.customItemInput } type='number' placeholder='0'
                                    onChange={(e) => this.customSortUpdate(e)}
                                    id='customSortAttention'
                                />
                                <div className={ style.customItemTitle }>Attention</div>
                            </div>
                            <div className={ style.customItemContainer }>
                                <input className={ style.customItemInput } type='number' placeholder='0'
                                    onChange={(e) => this.customSortUpdate(e)}
                                    id='customSortDate'
                                />
                                <div className={ style.customItemTitle }>Date</div>
                            </div>
                            <div className={ style.customItemContainer }>
                                <input className={ style.customItemInput } type='number' placeholder='0'
                                    onChange={(e) => this.customSortUpdate(e)}
                                    id='customSortLength'
                                />
                                <div className={ style.customItemTitle }>Length</div>
                            </div>
                            <div className={ style.customItemContainer }>
                                <input className={ style.customItemInput } type='number' placeholder='0'
                                    onChange={(e) => this.customSortUpdate(e)}
                                    id='customSortRating'
                                />
                                <div className={ style.customItemTitle }>Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        );
    }
}
 
const mapStateToProps = state => {
    let PlayersNumber = state.PlayersNumber;
    let CustomSort = state.CustomSort;
    return{ PlayersNumber, CustomSort }
}

export default connect(mapStateToProps)(Settings);
