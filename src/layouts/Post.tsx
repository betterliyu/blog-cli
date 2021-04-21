import React from 'react';
import Header from '../components/Header';
import { IPost, IBlog } from '../Blog';

export default function Post({ post, blog }: { post: IPost, blog: IBlog }) {
  return <div>
    <Header />
    <div dangerouslySetInnerHTML={{ __html: post.content }}>
    </div>
    <footer>this is a footer</footer>
  </div>;
};
