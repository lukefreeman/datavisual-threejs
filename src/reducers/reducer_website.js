import { FETCH_FLIGHT_DATA } from '../actions/types';

const INITIAL_STATE = {
	flightData: []
};

export default function(state = INITIAL_STATE, action) {

	switch(action.type) {
		case FETCH_FLIGHT_DATA:
			console.log('reducer flight data... ')
			return {...state, flightData: action.payload}
		default:
			return state;
	}

}