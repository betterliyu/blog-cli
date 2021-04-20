import React from 'react';
import Header from '../components/Header';

export default function Post(post: any) {
  return <div>
    <Header />
    <div dangerouslySetInnerHTML={{ __html: post.content }}>
    </div>
    <footer>this is a footer</footer>
  </div>;
};
