import { combineReducers } from 'redux';
import update from 'react-addons-update';

const VideoData = (state = [], action) => {
    switch(action.type){
        case 'VIDEO DATA CLEAR':
            return state = [];
        case 'VIDEO DATA ADD':
            return update(state, { $push: [action.value] });
        case 'VIDEO DATA UPDATE':
            return update(state, { $splice: [[action.index, 1, action.value]] })
        default:
            return state;
    }
}

const CategoryData = (state = [], action) => {
    switch(action.type){
        case 'CATEGORY DATA CLEAR':
            return state = [];
        case 'CATEGORY DATA ADD':
            return update(state, { $push: [action.value] });
        case 'CATEGORY DATA UPDATE':
            return update(state, { $splice: [[action.index, 1, action.value]] })
        default:
            return state;
    }
}

const CurrentCategory = (state = 0, action) => {
    return action.type === 'CURRENT CATEGORY UPDATE' ? state = action.value : state;
}

const CurrentPage = (state = 0, action) => {
    return action.type === 'CURRENT PAGE UPDATE' ? state = action.value : state;
}

const CustomSort = (state = { views: 30, attention: 25, date: 15, length: 10, rating: 20 }, action) => {
    return action.type === 'CUSTOM SORT UPDATE' ? state = action.value : state;
}

const CustomSortShow = (state = false, action) => {
    return action.type === 'CUSTOM SORT SHOW UPDATE' ? state = action.value : state;
}

const ChosenVideos = (state = [], action) => {
    switch(action.type){
        case 'CHOSEN VIDEOS ADD':
            return update(state, { $push: [action.value] });
        case 'CHOSEN VIDEOS REMOVE':
            return update(state, { $splice: [[action.value, 1]] });
        case 'CHOSEN VIDEOS CLEAR':
            return state = [];
        default:
            return state;
    }
}

const PosterChange = (state = null, action) => {
    return action.type === 'POSTER CHANGE' ? state = action.value : state;
}

const Volume = (state = 100, action) => {
    if(action.type === 'VOLUME UPDATE') return state = action.value;
    else return state;
}

const PlayersNumber = (state = 3, action) => {
    if(action.type === 'PLAYERS NUMBER UPDATE') return state = action.value;
    else return state;
}

export const Reducers = combineReducers({
    VideoData,
    CategoryData,
    CurrentCategory,
    CurrentPage,
    CustomSort,
    CustomSortShow,
    ChosenVideos,
    PosterChange,
    Volume,
    PlayersNumber
})

export const Action = (type, value, index) => {
    return{ type, value, index }
}
