import { useRouter } from "next/router";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  useFetchArticleHtml,
  useFetchAnnotations,
  useUpdateAnnotation,
} from "hooks";
import Article from "components/Article.js";

function addClassToElements(elements, className) {
  for (const element of elements) {
    element.classList.add(className);
  }
}

function removeClassFromElements(elements, className) {
  for (const element of elements) {
    element.classList.remove(className);
  }
}

function getAllHoveredHighlights() {
  return document.getElementsByClassName("bg-yellow-400");
}

function addHoverClassToRelatedHighlights(annotationId) {
  const relatedHighlights = getRelatedHighlights(annotationId);
  addClassToElements(relatedHighlights, "bg-yellow-400");
}

function removeAllHoverClasses() {
  // We use Array.from() since geElementsByClassName returns a live collection.
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection
  const hoveredHighlights = Array.from(getAllHoveredHighlights());
  removeClassFromElements(hoveredHighlights, "bg-yellow-400");
}

function extractAnnotationIdFromEvent(e) {
  return e.target.dataset.annotationId || "";
}

function getRelatedHighlights(annotationId) {
  return document.querySelectorAll(
    `.highlight[data-annotation-id="${annotationId}"]`
  );
}

function syncHoverBehavior(e, setFocusedHighlightId) {
  removeAllHoverClasses();

  const annotationId = extractAnnotationIdFromEvent(e);
  if (annotationId) {
    setFocusedHighlightId(annotationId);
    addHoverClassToRelatedHighlights(annotationId);
  }
}

function wrapHtml(rawHtml) {
  if (!rawHtml) return;
  return `<div id="content-highlightable" class="prose">` + rawHtml + `</div>`;
}

const CommentEditor = (props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "This is interesting because... This isn't clear to me because...",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      props.onChange(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
};

const Comments = (props) => {
  return;
  const [editorState, setEditorState] = useState();
  const markID = props.focusedHighlightId;
  const addComment = useUpdateAnnotation();

  if (!markID) {
    return;
  } else {
    return (
      <div>
        <p>{markID}</p>
        <CommentEditor onChange={setEditorState} />
        <button
          type="submit"
          onClick={() => {
            console.log(markID, editorState);
            addComment.mutate(markID, editorState);
          }}
        >
          Submit
        </button>
      </div>
    );
  }
};

const Reader = (props) => {
  const router = useRouter();
  const { articleUuid } = router.query;
  const [focusedHighlightId, setFocusedHighlightId] = useState();
  const {
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    data: dataArticle,
    error: errorArticle,
  } = useFetchArticleHtml(articleUuid);
  const {
    isLoading: isLoadingAnnotations,
    isError: isErrorAnnotations,
    data: dataAnnotations,
    error: errorAnnotations,
  } = useFetchAnnotations(articleUuid);

  if (isLoadingArticle) {
    return <span>Is Loading</span>;
  }
  if (isErrorArticle) {
    return <span>{error.message}</span>;
  }
  return (
    <div
      id="reader"
      className="flex flex-row mt-2"
      onMouseOver={(e) => syncHoverBehavior(e, setFocusedHighlightId)}
    >
      <Article
        html={wrapHtml(dataArticle.articleHtml)}
        fetchedAnnotations={dataAnnotations}
      />
      <Comments focusedHighlightId={focusedHighlightId} />
    </div>
  );
};

export default Reader;
