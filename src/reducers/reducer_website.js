import { UPDATE_SETTINGS } from '../actions/types';

const INITIAL_STATE = {
	data: {
		hue: 0,
		ambientLight: '#7F3636',
		directionalLight: '#ffffff',
		wireframe: false
	}
};

export default function(state = INITIAL_STATE, action) {

	switch(action.type) {
		case UPDATE_SETTINGS:
			return {...state, data: action.payload}
		default:
			return state;
	}

}