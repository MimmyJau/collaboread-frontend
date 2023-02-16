import { useState } from 'react'; 

const showHighlight = () => {
}

const ShowHighlightButton = (props) => {
  return (
    <button onClick={ () => {console.log(props.highlight); console.log(props.anchorOffset)} }>
      SHOW HIGHLIGHT!
    </button>
  )
}

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
  const [ anchorOffset, setAnchorOffset ] = useState(0);

  const setSelectedText = () => {
    if (!document.getSelection().isCollapsed) {
      console.log(window.getSelection())
    }
  }

  return (
    <div className="reader" onMouseUp={setSelectedText} dangerouslySetInnerHTML={{__html: innerHTML}}>
    </div>
  )
}

export default Reader;
