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

// fxn for getting normalized position of tag
// use node.textContent to get all text (but how to sync with
const normalizeRange = (range) => {
  // !! get all the chars prior to start
  // get next text node
  // count text elements in char
  // if text node is the same as start node in Range, then
  // add opening tag
  // if text node is the same as end node in Range, then
  // add closing tag
  // if node
};

// fxn for counting position of char in html ignoring tags
// fxn for turning normalized position into into range

const innerHTML = `
  <br />
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

const Reader = () => {
  const [highlight, setHighlight] = useState(null);
  const [range, setRange] = useState(null);

  const setSelectedText = () => {
    if (!document.getSelection().isCollapsed) {
      console.log(window.getSelection().getRangeAt(0));
      setRange(window.getSelection().getRangeAt(0));
    }
  };

  return (
    <div
      className="reader"
      onMouseUp={highlightSelection}
      onMouseOver={mouseOver}
    >
      <Interweave content={innerHTML} />
      <HighlightRangeButton range={range} />
    </div>
  );
};

export default Reader;
