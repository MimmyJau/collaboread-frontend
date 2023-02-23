import { useState } from "react";

import { Interweave } from "interweave";
import rangy from "rangy";
import "rangy/lib/rangy-highlighter";
import "rangy/lib/rangy-classapplier";

// Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
function highlightSelection() {
  rangy.init();
  const highlighter = rangy.createHighlighter();
  // We give each highlight a unique ID so that we
  // can easily find and synchronize CSS behaviour.
  const id = "markID-" + crypto.randomUUID();
  highlighter.addClassApplier(
    rangy.createClassApplier("bg-yellow-300", {
      ignoreWhiteSpace: true,
      onElementCreate: (el) => {
        el.classList.add(id);
      },
      tagNames: ["span", "a"],
    })
  );
  highlighter.highlightSelection("bg-yellow-300");

  const range = rangy.getSelection().getRangeAt(0);
  const startIndex = getIndexInReader(range.startContainer, range.startOffset);
  const endIndex = getIndexInReader(range.endContainer, range.endOffset);
  console.log(startIndex, endIndex);
}

function getReaderNode() {
  return document.getElementById("reader");
}

function getIndexInReader(container, offset) {
  let node = container;
  let count = offset;
  const readerNode = getReaderNode();
  if (!readerNode.contains(node)) return 0;
  while (true) {
    if (node.previousSibling) {
      node = node.previousSibling;
      count += node.textContent.length;
    } else if (node.parentNode && node.parentNode.id !== "reader") {
      node = node.parentNode;
    } else {
      break;
    }
  }
  return count;
}

// Given HTML and annotation data, reinsert highlight.
// Want to modify HTML string before adding it since this is React.
function insertHighlight(html, startIndex, endIndex) {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(html, "text/html");
  const text = doc.body.textContent;
  // TODO: Read into serializer module in Rangy.
  // Might not need raw text, just iterate through html

  console.log(text);
  console.log(startIndex, endIndex);
  return html;
}

const selectRange = (range) => {
  const mark = document.createElement("mark");
  range.surroundContents(mark);
};

const HighlightRangeButton = (props) => {
  return (
    <button
      onClick={() => {
        selectRange(props.range);
      }}
    >
      Highlight Range!
    </button>
  );
};

const InsertHighlightButton = () => {
  return (
    <button
      onClick={() => {
        insertHighlight(innerHTML, 10, 70);
      }}
    >
      Insert Highlight!
    </button>
  );
};

const removeHover = () => {
  // We use Array.from() since geElementsByClassName returns a live collection.
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection
  const relatedMarks = document.getElementsByClassName("bg-yellow-400");
  for (const mark of Array.from(relatedMarks)) {
    mark.classList.remove("bg-yellow-400");
  }
};

const getMarkID = (e) => {
  const classList = e.target.classList;
  for (const className of classList) {
    if (className.includes("markID")) {
      return className;
    }
  }
  return false;
};

const mouseOver = (e) => {
  removeHover();
  const markID = getMarkID(e);

  if (markID) {
    const relatedMarks = document.getElementsByClassName(markID);
    for (const mark of relatedMarks) {
      mark.classList.add("bg-yellow-400");
    }
  }
};

const innerHTML = `
  <h2>Welcome to the reader</h2>
  <br />
  <p>This is where we run tests on selection and annotation.</p>
  <br />
  <ul class="list-disc pl-5">
    <li>The first point being made</li>
    <li>The second point is <i>less important</i> than the first.</li>
  </ul>
  <br />
  <div>
    <span>This <b>is </b><b>span 1.</b> This is span 2.</span>
  </div>
`;

const Reader = () => {
  const [highlight, setHighlight] = useState(null);
  const [range, setRange] = useState(null);

  const setSelectedText = () => {
    if (!document.getSelection().isCollapsed) {
      setRange(window.getSelection().getRangeAt(0));
    }
  };

  return (
    <>
      <div
        id="reader"
        className="mt-2"
        onMouseUp={highlightSelection}
        onMouseOver={mouseOver}
      >
        <Interweave content={innerHTML} />
      </div>
      <div>
        <HighlightRangeButton range={range} />
      </div>
      <div>
        <InsertHighlightButton html={innerHTML} />
      </div>
    </>
  );
};

export default Reader;
