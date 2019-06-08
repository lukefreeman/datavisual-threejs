import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

import {AppTest} from './App';

Enzyme.configure({ adapter: new EnzymeAdapter() });

const setup = (props = {}, state = null) => {
    const wrapper = shallow(<AppTest {...props } />);
    if(state) wrapper.setState(state);
    return wrapper;
}

const findTestAttr = (wrapper, val) => {
    return wrapper.find(`[data-test="${val}"]`);
}

describe('Root App Component', () => {

    test('renders without error', ()=>{
        const wrapper = setup();
        const component = findTestAttr(wrapper, 'component-app');
        console.log(wrapper.debug());
    });

});

