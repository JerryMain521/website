import { statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import type { Root } from 'hast'
import rehypeRaw from 'rehype-raw'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

export default function rehypeBoardImages() {
  const parseRaw = rehypeRaw()

  return (tree: Root, file: VFile) => {
    if (!file.path || !/(?:^|[\\/])src[\\/]content[\\/]board[\\/].*\.md$/i.test(file.path)) {
      return
    }

    // Astro normally parses raw HTML after it collects and transforms Markdown images.
    const parsed = parseRaw(tree, file)
    const astro = (file.data.astro ??= {})
    const imagePaths = new Set(astro.localImagePaths)

    visit(parsed, 'element', ({ tagName, properties }) => {
      const { src } = properties
      if (tagName !== 'img' || typeof src !== 'string' || /^(?:[a-z][\w+.-]*:|\/)|[?#]/i.test(src)) {
        return
      }

      const path = decodeURI(src)
      if (statSync(resolve(dirname(file.path), path), { throwIfNoEntry: false })?.isFile()) {
        imagePaths.add(path)
      }
    })

    astro.localImagePaths = [...imagePaths]
    return parsed
  }
}
