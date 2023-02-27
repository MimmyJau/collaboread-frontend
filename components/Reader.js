import { useEffect, useState } from "react";

import { Interweave } from "interweave";
import rangy from "rangy";
import "rangy/lib/rangy-highlighter";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-serializer";
import "rangy/lib/rangy-textrange";

// Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
function highlightSelection({ highlighter, setHighlighter, highlights }) {
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
        el.onclick = () => removeHighlight(highlighter, highlights, id);
      },
      tagNames: ["span", "a"],
    })
  );
  highlighter.highlightSelection("bg-yellow-300");

  const readerNode = document.getElementById("reader");

  const range = rangy.getSelection().saveCharacterRanges(readerNode);
  range.id = id;
  return range;
}

function removeHighlight(highlighter, highlights, id) {
  const readerNode = document.getElementById("reader");
  const selection = rangy
    .getSelection()
    .restoreCharacterRanges(readerNode, highlights[id]);
  highlighter.unhighlightSelection();

  // Remove remaining span tags
  // Source 1: https://stackoverflow.com/a/9848612/
  // Source 2: https://stackoverflow.com/a/4232971/
  const highlightFragments = document.querySelectorAll("." + id);
  highlightFragments.forEach((el) => {
    const pa = el.parentNode;
    while (el.firstChild) {
      pa.insertBefore(el.firstChild, el);
    }
    pa.removeChild(el);
  });
}

/* Superceded by saveCharacterRanges()
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
*/

// Given HTML and annotation data, reinsert highlight.
// Want to modify HTML string before adding it since this is React.
function insertHighlight({ highlights, highlighter }) {
  const readerNode = document.getElementById("reader");
  for (const id in highlights) {
    const highlight = highlights[id];
    const selection = rangy
      .getSelection()
      .restoreCharacterRanges(readerNode, highlight);

    // Copied code from above to make sure each
    // highlight reinserted has a unique markID
    highlighter.addClassApplier(
      rangy.createClassApplier("bg-yellow-300", {
        ignoreWhiteSpace: true,
        onElementCreate: (el) => {
          el.classList.add(id);
          el.onclick = () => removeHighlight(highlighter, highlights, id);
        },
        tagNames: ["span", "a"],
      })
    );
    highlighter.highlightSelection("bg-yellow-300");
  }

  // To remove what looks like user selection after adding highlight
  rangy.getSelection().collapseToEnd();
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

function saveRange(props, range) {
  props.highlights[range.id] = range;
  props.setHighlights({
    ...props.highlights,
    [range.id]: range,
  });
}

const HighlightRangeButton = (props) => {
  return (
    <button
      onClick={() => {
        const range = highlightSelection(props);
        saveRange(props, range);
      }}
    >
      Highlight Range!
    </button>
  );
};

const InsertHighlightButton = (props) => {
  return (
    <button
      onClick={() => {
        insertHighlight(props);
      }}
    >
      Insert Highlight!
    </button>
  );
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
  const [highlights, setHighlights] = useState({});

  useEffect(() => {
    console.log(highlights);
  }, [highlights]);

  return (
    <div id="reader" className="mt-2" onMouseOver={syncHoverBehavior}>
      <Interweave content={innerHTML} />
      <div>
        <HighlightRangeButton
          highlighter={highlighter}
          setHighlighter={setHighlighter}
          highlights={highlights}
          setHighlights={setHighlights}
        />
      </div>
      <div>
        <InsertHighlightButton
          highlighter={highlighter}
          highlights={highlights}
        />
      </div>
    </div>
  );
};

export default Reader;
