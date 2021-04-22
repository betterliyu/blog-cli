import React from 'react';
import Header from '../components/Header';
import { IBlog, IPostLink } from '../Blog';

export default function Page({ blog }: { blog: IBlog }) {
  return <div>
    <Header />
    <div>
      {blog.categories.map((c) => {
        return <ul key={c}>
          <li key={c}>
            <h4>{c}</h4>
          </li>
          {
            blog.posts?.filter((post: IPostLink) => post.meta?.categories?.includes(c)).map(post => {
              return <li key={post.meta?.title}><a href={post.link}>{post.meta?.title}</a></li>
            })
          }
        </ul>
      })}
    </div>
  </div>;
};
