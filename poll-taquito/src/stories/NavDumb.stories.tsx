import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { NavDumb } from '../components/NavDumb';

export default {
  title: 'Example/Nav',
  component: NavDumb,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    votes: { control: 'number' },
  },
} as ComponentMeta<typeof NavDumb>;

const Template: ComponentStory<typeof NavDumb> = (args) => <NavDumb {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  votes: 0,
};
