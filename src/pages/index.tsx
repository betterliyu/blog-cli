import React from 'react';
import Header from '../components/Header';
import { IBlog } from '../Blog';

export default function Page({ blog }: { blog: IBlog }) {
  return <div>
    <Header />
    <a href={blog.Category} >Categories</a>
  </div>;
};
