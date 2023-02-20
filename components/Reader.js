import { useState } from 'react'; 

import { Interweave } from 'interweave';
import rangy from 'rangy';
import "rangy/lib/rangy-highlighter";
import "rangy/lib/rangy-classapplier";


// Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
function highlightSelection () {
  rangy.init()
  const highlighter = rangy.createHighlighter()
  highlighter.addClassApplier(rangy.createClassApplier('bg-yellow-300', {
    ignoreWhiteSpace: true,
    onElementCreate: el => {
      el.classList.add('poop')
    },
    tagNames: ['span', 'a']
  }))

  highlighter.highlightSelection('bg-yellow-300')
}

const selectRange = (range) => {
  const mark = document.createElement('mark');
  range.surroundContents(mark);
}

const HighlightRangeButton = (props) => {
  return (
    <button onClick={ () => {selectRange(props.range)} }>
      Highlight Range!
    </button>
  )
}

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
}

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
`

const removeHover = () => {
    const otherMarks = document.getElementsByClassName("poop")
    for (const mark of otherMarks) {
      mark.classList.remove("bg-yellow-400")
    }
}


const mouseOver = (e)  => {
  removeHover()

  // Want the id to start with a recognizable token that we can regex
  if (e.target.classList.contains("poop")) {
    const otherMarks = document.getElementsByClassName("poop")
    console.log(otherMarks)
    for (const mark of otherMarks) {
      mark.classList.add("bg-yellow-400")
    }
  } 
}

const Reader = () => {
  const [ highlight, setHighlight ] = useState(null);
  const [ range, setRange ] = useState(null);

  const setSelectedText = () => {
    if (!document.getSelection().isCollapsed) {
      console.log(window.getSelection().getRangeAt(0))
      setRange(window.getSelection().getRangeAt(0))
    }
  }

  return (
    <div className="reader" onMouseUp={highlightSelection} onMouseOver={mouseOver}>
      <Interweave content={innerHTML} />
      <HighlightRangeButton range={range} />
    </div>
  )
}

export default Reader;
