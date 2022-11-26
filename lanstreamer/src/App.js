import React, { Component } from 'react';
import axios from 'axios';
import Videos from './Videos';
import Player from './Player';
import Home from './Home';
import Settings from './Settings';
import Login from './Login';
import { Action } from './Store';
import { connect } from 'react-redux';
import { Route, Router, Switch } from 'react-router-dom';
import History from './History';
import './App.scss';
import cookie from 'js-cookie';
import { gapi } from "gapi-script";
import jsonData from './data.json'

class App extends Component {
  componentDidMount = () => {
    const initClient = () => {
      gapi.client.init({
        clientId: window.googleClientId,
        scope: ''
      });
    };
    gapi.load('client:auth2', initClient);

    let customSort = cookie.get('customSort');
    let playersNumber = cookie.get('playersNumber');
    let previewParts = cookie.get('previewParts');
    let previewClipDuration = cookie.get('previewClipDuration');
    if(customSort !== undefined) this.props.dispatch(Action('CUSTOM SORT UPDATE', JSON.parse(customSort)));
    if(playersNumber !== undefined) this.props.dispatch(Action('PLAYERS NUMBER UPDATE', playersNumber));
    if(previewParts !== undefined) window.previewParts = previewParts;
    if(previewClipDuration !== undefined) window.previewClipDuration = previewClipDuration;
    this.getVideos(window.demo ? window.server : window.localhost);
  }

  getVideos = (address) => {
    if(History.location.pathname === '/videos'){
      this.loading('display');
    }
    this.props.dispatch(Action('CATEGORY DATA CLEAR'));
    this.props.dispatch(Action('VIDEO DATA CLEAR'));
    window.webAddress = address;
    cookie.set('webAddress', address, { expires: 1 });
    if (window.demo) {
      let videos = jsonData.videos;
      let categories = jsonData.categories;
      for(let i = 0; i < videos.length; i ++){
        this.props.dispatch(Action('VIDEO DATA ADD', videos[i]));
      }
      for(let i = 0; i < categories.length; i ++){
        this.shuffle(categories[i].videos);
        this.props.dispatch(Action('CATEGORY DATA ADD', { name: categories[i].name, videos: categories[i].videos }));
      }
      this.loading('hide');
    } else {
      axios.post(window.webAddress + 'data')
      .then((message) => {
        if(message.data.response === undefined){
          let videos = message.data.videos;
          let categories = message.data.categories;
          for(let i = 0; i < videos.length; i ++){
            this.props.dispatch(Action('VIDEO DATA ADD', videos[i]));
          }
          for(let i = 0; i < categories.length; i ++){
            this.shuffle(categories[i].videos);
            this.props.dispatch(Action('CATEGORY DATA ADD', { name: categories[i].name, videos: categories[i].videos }));
          }
          this.loading('hide');
        } else {
          this.loading('hide');
          document.getElementById('warningAlert').style.left = '0px';
          document.getElementById('alertText').innerText = message.data.response;
        }
      })
      .catch(() => {
        this.loading('hide');
        document.getElementById('warningAlert').style.left = '0px';
        document.getElementById('alertText').innerText = 'SERVER CONNECTION ERROR';
      })
    }
  }

  shuffle(array){
    let currentIndex = array.length, randomIndex;
    while (0 !== currentIndex){
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  loading = (action) => {
    if(action === 'display'){
      document.getElementById('loadingBackground').style.display = 'block';
      document.getElementById('loading').style.display = 'inline-block';
      document.getElementById('loadingText').style.display = 'block';
    }
    if(action === 'hide'){
      document.getElementById('loadingBackground').style.display = 'none';
      document.getElementById('loading').style.display = 'none';
      document.getElementById('loadingText').style.display = 'none';
    }
  }

  closeAlert = () => {
    document.getElementById('warningAlert').style.left = '-415px';
  }

  render(){
    return(
      <div>
        <div id='loadingBackground'></div>
        <div id='loadingText'>Loading. This may take up to one minute.</div>
        <div id='loading'><div></div><div></div><div></div></div>
        <div id='warningAlert'>
          <h3 id='alertText' className='alertText'>_</h3>
          <div className="close" onClick={ this.closeAlert }>&times;</div>
        </div>
        <Router history={ History }>
          <Switch>
            <Route path='/' component={() => (<Home getVideos={ this.getVideos } />) } exact />
            <Route path='/videos' component={ Videos } exact />
            <Route path='/player' component={ Player } exact />
            <Route path='/settings' component={ Settings } exact />
            <Route path='/google-login' component={ Login } exact />
          </Switch>
        </Router>
      </div>
    );
  }
}

const mapStateToProps = () => { return{} }

export default connect(mapStateToProps)(App);
