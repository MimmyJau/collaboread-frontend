import { useState } from 'react'; 

import { Interweave } from 'interweave';

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
  <p></p>
  <p>This is where we run tests on selection and annotation.</p>
  <br />
  <ul className="list-disc pl-5">
    <li>The first point being made</li>
    <li>The second point is <i>less important</i> than the first.</li>
  </ul>
  <div>
    <span>This <b>is </b><b>span 1.</b> This is span 2.</span>
  </div>
`

const Reader = () => {
  const [ highlight, setHighlight ] = useState(null);
  const [ range, setRange ] = useState(null);

  const setSelectedText = () => {
    if (!document.getSelection().isCollapsed) {
      // console.log(window.getSelection())
      console.log(window.getSelection().getRangeAt(0))
      setRange(window.getSelection().getRangeAt(0))
    }
  }

  return (
    <div className="reader" onMouseUp={setSelectedText}>
      <Interweave content={innerHTML} />
      <HighlightRangeButton range={range} />
    </div>
  )
}

export default Reader;
