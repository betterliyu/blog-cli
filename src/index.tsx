import './index.css';
import { hot } from 'react-hot-loader/root';
import React from 'react';
import { render } from 'react-dom'
import Post from './layout/Post';

const App = hot(Post);

render(<App />, document.querySelector('#app'));
