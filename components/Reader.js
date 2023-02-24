import { useState } from "react";

import { Interweave } from "interweave";
import rangy from "rangy";
import "rangy/lib/rangy-highlighter";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-serializer";

// Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
function highlightSelection({ highlighter, setHighlighter }) {
  if (!highlighter) {
    rangy.init();
    highlighter = rangy.createHighlighter();
    setHighlighter(highlighter);
  }
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
  console.log(highlighter.serialize());
  console.log(rangy.getSelection().getRangeAt(0));

  const range = rangy.getSelection().getRangeAt(0);
  const startIndex = getIndexInReader(range.startContainer, range.startOffset);
  const endIndex = getIndexInReader(range.endContainer, range.endOffset);
  console.log(startIndex, endIndex);
}

function getIndexInReader(container, offset) {
  let node = container;
  let count = offset;
  const readerNode = document.getElementById("reader");
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
function insertHighlight(html) {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(html, "text/html");
  const text = doc.body.textContent;

  rangy.init();
  const rangeInput = rangy.getSelection().getRangeAt(0);
  const readerRootInput = document.getElementById("reader-root");
  const serializedRange = rangy.serializeRange(
    rangeInput,
    false,
    readerRootInput
  );

  // TODO: Discrepancy because the range is serialized after highlighting
  const readerRootOutput = doc.getElementById("reader-root");
  console.log("reader-root in", readerRootInput);
  console.log("reader-root out", readerRootOutput);
  const rangeOutput = rangy.deserializeRange(serializedRange, readerRootOutput);
  console.log(newHTML);

  return html;
}

function syncHoverBehavior(e) {
  function removeHover() {
    // We use Array.from() since geElementsByClassName returns a live collection.
    // Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection
    const relatedMarks = document.getElementsByClassName("bg-yellow-400");
    for (const mark of Array.from(relatedMarks)) {
      mark.classList.remove("bg-yellow-400");
    }
  }

  function getMarkID(e) {
    const classList = e.target.classList;
    for (const className of classList) {
      if (className.includes("markID")) {
        return className;
      }
    }
    return false;
  }

  removeHover();
  const markID = getMarkID(e);

  if (markID) {
    const relatedMarks = document.getElementsByClassName(markID);
    for (const mark of relatedMarks) {
      mark.classList.add("bg-yellow-400");
    }
  }
}

function saveRange() {
  rangy.init();
  const range = rangy.getSelection().getRangeAt(0);
  // Maybe a place to use a ref
  const reader = document.getElementById("reader");
  const serializedRange = rangy.serializeRange(range, false, reader);
  console.log(serializedRange);
  const serializedHighlights = rangy.highlighter.serialize();
  console.log(serializedHighlights);
  // PUT request
}

const HighlightRangeButton = (props) => {
  return (
    <button
      onClick={() => {
        highlightSelection(props);
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

const SaveRangeButton = () => {
  return <button onClick={saveRange}>Save Range!</button>;
};

const innerHTML = `
  <div id="reader-root">
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
  </div>
`;

const Reader = () => {
  const [highlighter, setHighlighter] = useState(null);

  return (
    <>
      <div id="reader" className="mt-2" onMouseOver={syncHoverBehavior}>
        <Interweave content={innerHTML} />
      </div>
      <div>
        <HighlightRangeButton
          highlighter={highlighter}
          setHighlighter={setHighlighter}
        />
      </div>
      <div>
        <SaveRangeButton />
      </div>
      <div>
        <InsertHighlightButton html={innerHTML} />
      </div>
    </>
  );
};

export default Reader;
