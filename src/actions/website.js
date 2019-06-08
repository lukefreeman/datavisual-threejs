import { FETCH_FLIGHT_DATA } from './types';
import flightData from '../flightData';

export function fetchFlightData() {

	const data = flightData.map(flight => {
		return {
				from: {
						coordinates: [flight[0][1], flight[0][0]],
				},
				to: {
						coordinates: [flight[1][1], flight[1][0]]
				}
		}
	});

	return {
		type: FETCH_FLIGHT_DATA,
		payload: data
  };
    
}