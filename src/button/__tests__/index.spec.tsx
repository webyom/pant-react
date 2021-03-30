import { mount } from 'enzyme';
import { Button } from '../';

describe('Button', () => {
  it('shoud render children content', () => {
    const wrapper = mount(<Button type="default">Default</Button>);
    expect(wrapper.text()).toMatch('Default');
  });
});
