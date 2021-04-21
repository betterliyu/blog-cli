type Meta = {
  title: string,
  category: string,
  tags: string[],
  Layout?: string,
  date: string,
  updated: string,
}

export type IPost = {
  meta: Meta,
  content: string,
}

export type IPostLink = {
  link: string,
  meta: Meta,
}


export type IBlog = {
  posts: IPostLink[],
  tags: string[],
  categories: string[],
  [k: string]: any,
}
