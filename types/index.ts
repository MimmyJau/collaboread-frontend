
export interface Highlight {
    characterRange: {
        start: number;
        end: number;
    },
    backward: boolean;
}

export interface User {
    uuid: string;
    username: string;
}

export interface Annotation {
    uuid: string;
    user: User;
    highlight: Array<Highlight>
    commentHtml: string;
    commentJson: string;
}

export interface FlatAnnotation {
    uuid: string;
    user: User;
    highlightStart: number;
    highlightEnd: number;
    highlightBackward: boolean;
    commentHtml: string;
    commentJson: string;
}

export interface User {
    id: number;
    uuid: string;
    username: string;
    email: string;
    dateJoined: string;
}
