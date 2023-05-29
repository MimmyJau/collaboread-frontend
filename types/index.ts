export interface Article {
  uuid: string;
  user: string;
  title: string;
  author?: string;
  articleHtml: string;
  articleJson?: string;
  articleText?: string;
  level: number;
  prev: Array<string>;
  next: Array<string>;
  children: Array<Article>;
}

export interface Highlight {
  characterRange: {
    start: number;
    end: number;
  };
  serialization: string;
  backward: boolean;
}

export interface Comment {
  uuid: string;
  user: string;
  article: string;
  annotation: string;
  parent: string;
  commentHtml: string;
  commentJson: string;
  commentText: string;
}

export interface Annotation {
  uuid?: string;
  user: string;
  article: string;
  highlight: Array<Highlight>;
  comments: Array<Comment>;
  isPublic: boolean;
}

export interface FlatAnnotation {
  uuid?: string;
  user: string;
  article: string;
  highlightStart: number;
  highlightEnd: number;
  highlightSerialization: string;
  highlightBackward: boolean;
  comments: Array<Comment>;
  isPublic: boolean;
}

export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  dateJoined: string;
}
