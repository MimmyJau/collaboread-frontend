
export interface Highlight {
    characterRange: {
        start: number;
        end: number;
    },
    backward: boolean;
}

export interface Comment {
    uuid: string;
    user: User;
    annotation: string;
    replyTo: string;
    commentHtml: string;
    commentJson: string;
}

export interface User {
    uuid: string;
    username: string;
}

export interface Annotation {
    uuid: string;
    user: User;
    article: string;
    highlight: Array<Highlight>;
    comments: Array<Comment>;
}

export interface FlatAnnotation {
    uuid: string;
    user: User;
    article: string;
    highlightStart: number;
    highlightEnd: number;
    highlightBackward: boolean;
    comments: Array<Comment>;
}

export interface User {
    id: number;
    uuid: string;
    username: string;
    email: string;
    dateJoined: string;
}
