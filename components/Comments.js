import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Interweave } from "interweave";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/20/solid";

import Dropdown from "components/Dropdown";
import Editor from "components/Editor";
import { useDeleteAnnotation, useCreateComment, useUpdateComment } from "hooks";
import useAuth from "hooks/auth";

const TextButton = (props) => {
  return (
    <button
      onClick={() => props.onClick()}
      className="text-blue-500 hover:text-blue-700 mr-2"
    >
      {props.text}
    </button>
  );
};

const PostCommentButton = (props) => {
  return (
    <button
      disabled={!props.enabled}
      className="px-2 py-1 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
      onClick={() => {
        props.onClick();
      }}
    >
      {!props.enabled ? "Posted" : "Post"}
    </button>
  );
};

const UserInfo = ({ user, isOwner, annotation }) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="p-2">
        <span className="text-sm font-semibold">{user.username}</span>
      </div>
      {isOwner ? (
        <Dropdown
          annotationUuid={annotation.uuid}
          highlight={annotation.highlight}
        />
      ) : null}
    </div>
  );
};

const CommentClickable = (props) => {
  return (
    <div
      className="p-2 pr-5 border-b hover:bg-gray-50"
      tabIndex="0"
      onClick={() => {
        document
          .querySelector(
            `.highlight[data-annotation-id="${props.annotationUuid}"]`
          )
          .scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    >
      {props.children}
    </div>
  );
};

const CommentBody = (props) => {
  if (props.isEditing) {
    return (
      <Editor
        annotationUuid={props.annotationUuid}
        placeholder={"What is your interpretation of this passage?"}
        content={props.content}
        onChange={{
          html: props.onChange.html,
          json: props.onChange.json,
          text: props.onChange.text,
        }}
      />
    );
  } else {
    return <Interweave content={props.content} />;
  }
};

const CommentButtons = (props) => {
  const { articleUuid } = useRouter().query;
  const createComment = useCreateComment(articleUuid);
  const updateComment = useUpdateComment(articleUuid);

  const postComment = props.commentUuid ? updateComment : createComment;
  const commentUuid = props.commentUuid || crypto.randomUUID();

  if (props.isEditing) {
    return (
      <div className="flex flex-row pt-2 justify-end">
        <TextButton onClick={() => props.setIsEditing(false)} text="Cancel" />
        <PostCommentButton
          enabled={props.editorHtml !== props.content}
          onClick={() => {
            const newComment = {
              uuid: commentUuid,
              article: articleUuid,
              annotation: props.annotationUuid,
              commentHtml: props.editorHtml,
              commentJson: props.editorJson,
              commentText: props.editorText,
            };
            postComment.mutate(newComment, {
              onSuccess: () => {
                props.setIsEditing(false);
              },
            });
          }}
        />
      </div>
    );
  } else if (props.isOwner) {
    return (
      <div className="flex flex-row pt-4 justify-end">
        <TextButton onClick={() => props.setIsEditing(true)} text="Edit" />
      </div>
    );
  }
};

const Comment = (props) => {
  const [editorHtml, setEditorHtml] = useState("");
  const [editorJson, setEditorJson] = useState("");
  const [editorText, setEditorText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  const thereExistsComment = !!props.comment?.commentText;
  const isOwner = props.user.uuid === user.uuid;

  useEffect(() => {
    if (thereExistsComment) {
      setEditorHtml(props.comment.commentHtml);
      setEditorJson(props.comment.commentJson);
      setEditorText(props.comment.commentText);
    } else if (isOwner) {
      setIsEditing(true);
    }
  }, [props.annotationUuid]);

  return (
    <CommentClickable annotationUuid={props.annotationUuid}>
      <UserInfo
        user={props.user}
        isOwner={isOwner}
        annotation={props.annotation}
      />
      <CommentBody
        isEditing={isEditing}
        annotationUuid={props.annotationUuid}
        content={props.comment ? props.comment.commentHtml : "<p></p>"}
        onChange={{
          html: setEditorHtml,
          json: setEditorJson,
          text: setEditorText,
        }}
      />
      <CommentButtons
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isOwner={isOwner}
        annotationUuid={props.annotationUuid}
        commentUuid={props.comment ? props.comment.uuid : ""}
        content={props.comment ? props.comment.commentHtml : "<p></p>"}
        editorHtml={editorHtml}
        editorJson={editorJson}
        editorText={editorText}
      />
    </CommentClickable>
  );
};

const CommentOld = (props) => {
  const [editorHtml, setEditorHtml] = useState(props.comment.commentHtml || "");
  const [editorJson, setEditorJson] = useState(props.comment.commentJson || "");
  const [editorText, setEditorText] = useState(props.comment.commentText || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const { articleUuid } = router.query;
  const createComment = useCreateComment(articleUuid);
  const { user } = useAuth();

  useEffect(() => {
    // Check if we're in read-only mode or edit mode
    if (props.comment.commentHtml || "") {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    // Check if we're the owner of this comment
    if (props.user?.uuid === user?.uuid) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [props.comment.uuid]);

  function postComment({
    annotationUuid,
    commentHtml,
    commentJson,
    commentText,
  }) {
    const newComment = {
      uuid: crypto.randomUUID(),
      article: articleUuid,
      annotation: annotationUuid,
      commentHtml: commentHtml,
      commentJson: commentJson,
      commentText: commentText,
    };
    createComment.mutate(newComment, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  }

  return (
    <div
      className="p-2 pr-5 border-b hover:bg-gray-50"
      tabIndex="0"
      onClick={() => {
        document
          .querySelector(
            `.highlight[data-annotation-id="${props.annotationUuid}"]`
          )
          .scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    >
      <UserInfo user={props.user} isOwner={props.isOwner} />
      {isOwner ? <Dropdown annotation={props.comment} /> : null}
      {isEditing && isOwner ? (
        <>
          <Editor
            annotationUuid={props.annotationUuid}
            placeholder={"What is your interpretation of this passage?"}
            content={props.comment.commentHtml}
            onChange={{ html: setEditorHtml, json: setEditorJson }}
          />
          <div className="flex flex-row pt-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="text-blue-500 hover:text-blue-700 mr-2"
            >
              Cancel
            </button>
            <PostCommentButton
              enabled={editorHtml !== props.comment.commentHtml || ""}
              postComment={() => {
                postComment({
                  annotationUuid: props.comment.uuid,
                  commentHtml: editorHtml,
                  commentJson: editorJson,
                  commentText: editorText,
                });
              }}
            />
          </div>
        </>
      ) : (
        <div className="p-2">
          <Interweave content={props.comment.commentHtml || ""} />
          {isOwner ? (
            <div className="flex flex-row pt-4 justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const ReplyBox = (props) => {
  const [editorHtml, setEditorHtml] = useState("");
  const [editorJson, setEditorJson] = useState("");
  return (
    <div className="p-2 flex flex-row border border-green-500">
      <div className="flex-grow mr-1">
        <Editor
          placeholder={"Leave a reply..."}
          onChange={{ html: setEditorHtml, json: setEditorJson }}
        />
      </div>
      <button
        disabled={!props.enabled}
        className="text-base px-2 py-2 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        onClick={() => {
          console.log("reply button clicked!");
        }}
      >
        <ChatBubbleBottomCenterIcon
          className="h-5 w-5 text-green-200"
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

const Thread = (props) => {
  const { user } = useAuth();

  return (
    <div>
      <Comment
        comment={props.comments}
        user={props.user}
        annotationUuid={props.annotationUuid}
        annotation={props.annotation}
      />
      {user && props.comments?.commentHtml ? <ReplyBox /> : null}
    </div>
  );
};

const SignUpMessage = () => {
  return (
    <div className="p-2 pr-5 border-b hover:bg-gray-50 text-center">
      <Link
        href="/signup"
        className="font-medium text-blue-600 hover:text-blue-500"
      >
        Sign up
      </Link>
      &nbsp;to leave comments.
    </div>
  );
};

const Comments = (props) => {
  if (!props.fetchedAnnotations) return;
  const annotationUuid = props.focusedHighlightId;
  const annotations = props.fetchedAnnotations;

  const focusedAnnotation = props.fetchedAnnotations.find(
    (annotation) => annotation.uuid === annotationUuid
  );
  const showSignUpMessage = props.unauthorizedSelection && !focusedAnnotation;

  return (
    <div className={`${props.className} shadow`}>
      {focusedAnnotation ? (
        <Thread
          comments={focusedAnnotation.comments[0]}
          user={focusedAnnotation.user}
          annotationUuid={focusedAnnotation.uuid}
          annotation={focusedAnnotation}
        />
      ) : null}
      {showSignUpMessage ? <SignUpMessage /> : null}
    </div>
  );
};

export default Comments;
