import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Interweave } from "interweave";

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

const UserInfo = ({ user, isOwner, annotationUuid, annotationHighlight }) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <span className="text-sm font-semibold">{user.username}</span>
      {isOwner ? (
        <Dropdown
          annotationUuid={annotationUuid}
          highlight={annotationHighlight}
        />
      ) : null}
    </div>
  );
};

const CommentClickable = (props) => {
  return (
    <div
      className="p-2 pr-5 hover:bg-gray-50"
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
              parentUuid: props.parentUuid,
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
  const [parentUuid, setParentUuid] = useState(null);
  const [editorHtml, setEditorHtml] = useState("");
  const [editorJson, setEditorJson] = useState("");
  const [editorText, setEditorText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  const thereExistsComment = !!props.comment?.commentText;
  const isOwner = props.user.username === user?.username;

  useEffect(() => {
    if (thereExistsComment) {
      setEditorHtml(props.comment.commentHtml);
      setEditorJson(props.comment.commentJson);
      setEditorText(props.comment.commentText);
    } else if (isOwner) {
      setIsEditing(true);
    }

    if (props.parentUuid) {
      setParentUuid(props.parentUuid);
    }
  }, [props.annotationUuid]);

  return (
    <div className="flex-grow pl-2">
      <UserInfo
        user={props.user}
        isOwner={isOwner}
        annotationUuid={props.annotationUuid}
        annotationHighlight={props.annotationHighlight}
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
        parentUuid={parentUuid}
        commentUuid={props.comment ? props.comment.uuid : ""}
        content={props.comment ? props.comment.commentHtml : "<p></p>"}
        editorHtml={editorHtml}
        editorJson={editorJson}
        editorText={editorText}
      />
      <Replies replies={props.comment.children} />
    </div>
  );
};

const Reply = ({ comment }) => {
  return (
    <div className="flex flex-row my-2">
      <div className="basis-5 border-r-4"></div>
      <div className="basis-5"></div>
      <Comment
        comment={comment}
        user={{ username: comment.user }}
        annotationUuid={comment.annotation}
        annotationHighlight={null}
      />
    </div>
  );
};

const Replies = (props) => {
  if (props.replies.length) {
    return (
      <div>
        <hr className="my-3" />
        {props.replies.map((comment, index) => {
          return (
            <>
              <Reply key={index} comment={comment} />
            </>
          );
        })}
      </div>
    );
  }
};

const ReplyEditor = (props) => {
  const [parentUuid, setParentUuid] = useState(null);
  const [editorHtml, setEditorHtml] = useState("");
  const [editorJson, setEditorJson] = useState("");
  const [editorText, setEditorText] = useState("");
  const { articleUuid } = useRouter().query;
  const createComment = useCreateComment(articleUuid);

  const commentUuid = props.commentUuid || crypto.randomUUID();

  useEffect(() => {
    if (props.parentUuid) {
      setParentUuid(props.parentUuid);
    }
  }, [props.annotationUuid]);

  return (
    <div className="p-2 flex flex-row">
      <div className="flex-grow mr-1">
        <Editor
          placeholder={"Leave a reply..."}
          onChange={{
            html: setEditorHtml,
            json: setEditorJson,
            text: setEditorText,
          }}
        />
      </div>
      <PostCommentButton
        enabled={!!editorText}
        onClick={() => {
          const newComment = {
            uuid: commentUuid,
            article: articleUuid,
            annotation: props.annotationUuid,
            parentUuid: props.parentUuid,
            commentHtml: editorHtml,
            commentJson: editorJson,
            commentText: editorText,
          };
          createComment.mutate(newComment, {
            onSuccess: () => {},
          });
        }}
      />
    </div>
  );
};

const Thread = (props) => {
  const { user } = useAuth();

  const showReply = user && props.comments;

  return (
    <div>
      <CommentClickable annotationUuid={props.annotationUuid}>
        <Comment
          comment={props.comments}
          user={props.user}
          annotationUuid={props.annotationUuid}
          annotationHighlight={props.annotationHighlight}
        />
      </CommentClickable>
      {showReply ? (
        <ReplyEditor
          user={props.user}
          parentUuid={props.comments.uuid}
          annotationUuid={props.annotationUuid}
        />
      ) : null}
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
          annotationHighlight={focusedAnnotation.highlight}
        />
      ) : null}
      {showSignUpMessage ? <SignUpMessage /> : null}
    </div>
  );
};

export default Comments;
