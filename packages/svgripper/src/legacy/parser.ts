import { SAXParser } from 'sax'

function parseSVG(svgString: string): any {
  const parser = new SAXParser(true)
  const svgJson: any = { tagName: 'svg', attributes: {}, children: [] }
  let currentElement = svgJson

  parser.onopentag = (node) => {
    const newElement: any = {
      tagName: node.name,
      attributes: node.attributes,
      children: [],
    }
    currentElement.children.push(newElement)
    currentElement = newElement
  }

  parser.onclosetag = () => {
    if (currentElement.tagName !== 'svg') {
      currentElement = Object.assign({}, currentElement)
    }
  }

  parser.ontext = (text) => {
    if (text.trim().length > 0) {
      currentElement.children.push(text)
    }
  }

  parser.write(svgString).close()

  return svgJson
}

// Example usage:
const svgString = `<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>`

// const svgJson = parseSVG(svgString)
// console.log(JSON.stringify(svgJson, null, 2))
