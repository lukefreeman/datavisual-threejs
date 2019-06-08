import { combineReducers } from 'redux';
import WebsiteReducer from './reducer_website';

const rootReducer = combineReducers({
	website: WebsiteReducer
});

export default rootReducer;