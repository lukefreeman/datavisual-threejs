import { FETCH_SETTINGS, UPDATE_SETTINGS } from './types';

export function fetchSettings() {
	return {
		type: FETCH_SETTINGS,
		payload: []
  	};
}

export function updateSettings(data) {
	return {
		type: UPDATE_SETTINGS,
		payload: data
  	};  
}