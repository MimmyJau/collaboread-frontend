
export interface Highlight {
    characterRange: {
        start: number;
        end: number;
    },
    backward: boolean;
}

export interface Annotation {
    uuid: string;
    highlight: Array<Highlight>
    commentHtml: string;
    commentJson: string;
}

export interface FlatAnnotation {
    uuid: string;
    highlightStart: number;
    highlightEnd: number;
    highlightBackward: boolean;
    commentHtml: string;
    commentJson: string;
}
