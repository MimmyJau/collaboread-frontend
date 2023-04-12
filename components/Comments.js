import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

import { Interweave } from "interweave";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Menu, Transition } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/20/solid";

import { useUpdateAnnotation, useDeleteAnnotation } from "hooks";
import { clearHighlight } from "utils";
import useAuth from "hooks/auth";

const printJson = (editor) => {
  return JSON.stringify(editor.getJSON());
};

const printHtml = (editor) => {
  return editor.getHTML();
};

const CommentEditor = (props) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: "What is your interpretation of this passage?",
        }),
      ],
      content: props.content || "",
      editorProps: {
        attributes: {
          class:
            "py-2 px-1 bg-white rounded border border-gray-200 focus:outline-none focus:border focus:border-gray-400 hover:border hover:border-gray-300",
        },
      },
      onUpdate: ({ editor }) => {
        props.onChange.html(editor.getHTML());
        props.onChange.json(JSON.stringify(editor.getJSON()));
      },
    },
    [props.annotationUuid]
  );

  return <EditorContent editor={editor} />;
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Dropdown = (props) => {
  const { articleUuid } = useRouter().query;
  const deleteAnnotation = useDeleteAnnotation(articleUuid);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900">
          <EllipsisVerticalIcon
            className="-ml-1 -mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  onClick={() => {
                    deleteAnnotation.mutate(props.annotation.uuid, {
                      onSuccess: () => {
                        clearHighlight(
                          props.annotation.uuid,
                          props.annotation.highlight
                        );
                      },
                    });
                  }}
                  className={classNames(
                    active ? "bg-gray-100 text-red-500" : "text-red-500",
                    "block px-4 py-2 text-sm font-semibold"
                  )}
                >
                  Delete
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const PostCommentButton = (props) => {
  return (
    <button
      disabled={!props.enabled}
      className="px-2 py-1 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
      onClick={() => {
        props.updateComment();
      }}
    >
      {!props.enabled ? "Posted" : "Post"}
    </button>
  );
};

const UserInfo = (props) => {
  return (
    <div className="p-2">
      <span className="text-sm font-semibold">{props.user.username}</span>
    </div>
  );
};

const Comment = (props) => {
  const [editorHtml, setEditorHtml] = useState(props.annotation.commentHtml);
  const [editorJson, setEditorJson] = useState(props.annotation.commentJson);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const { articleUuid } = router.query;
  const updateAnnotation = useUpdateAnnotation(articleUuid);
  const { user } = useAuth();

  useEffect(() => {
    if (props.annotation.commentHtml) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }

    if (props.annotation.user?.uuid === user?.uuid) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [props.annotation.uuid]);

  function updateComment(annotationUuid, commentHtml, commentJson) {
    const newAnnotation = {
      ...props.annotation,
      commentHtml: commentHtml,
      commentJson: commentJson,
    };
    updateAnnotation.mutate(newAnnotation, {
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
            `.highlight[data-annotation-id="${props.annotation.uuid}"]`
          )
          .scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    >
      <div className="flex flex-row justify-between items-center">
        <UserInfo user={props.annotation.user} />
        {isOwner ? <Dropdown annotation={props.annotation} /> : null}
      </div>
      {isEditing && isOwner ? (
        <>
          <CommentEditor
            annotationUuid={props.annotation.uuid}
            content={props.annotation.commentHtml}
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
              enabled={editorHtml !== props.annotation.commentHtml}
              updateComment={() => {
                updateComment(props.annotation.uuid, editorHtml, editorJson);
              }}
            />
          </div>
        </>
      ) : (
        <div className="p-2">
          <Interweave content={props.annotation.commentHtml} />
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

const ReplyEditor = (props) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: "Leave a thoughtful reply...",
        }),
      ],
      content: props.content || "",
      editorProps: {
        attributes: {
          class:
            "py-2 px-1 bg-white rounded border border-gray-200 focus:outline-none focus:border focus:border-gray-400 hover:border hover:border-gray-300",
        },
      },
      onUpdate: ({ editor }) => {
        props.onChange.html(editor.getHTML());
        props.onChange.json(JSON.stringify(editor.getJSON()));
      },
    },
    [props.annotationUuid]
  );

  return <EditorContent editor={editor} />;
};

const ReplyBox = (props) => {
  const [editorHtml, setEditorHtml] = useState("");
  const [editorJson, setEditorJson] = useState("");
  return (
    <div className="p-2 flex flex-row border border-green-500">
      <div className="flex-grow mr-1">
        <ReplyEditor onChange={{ html: setEditorHtml, json: setEditorJson }} />
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

const Comments = (props) => {
  if (!props.fetchedAnnotations) return;
  const annotationUuid = props.focusedHighlightId;
  const annotations = props.fetchedAnnotations;

  const focusedAnnotation = props.fetchedAnnotations.find(
    (annotation) => annotation.uuid === annotationUuid
  );
  return (
    <div className={`${props.className} shadow`}>
      {focusedAnnotation ? <Comment annotation={focusedAnnotation} /> : null}
      {props.unauthorizedSelection && !focusedAnnotation ? (
        <SignUpMessage />
      ) : null}
      <ReplyBox />
    </div>
  );
};

export default Comments;
