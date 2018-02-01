import { join } from 'path'

// This plugin modifies the require-ensure code generated by Webpack
// to work with Next.js SSR
export default class NextJsSsrImportPlugin {
  constructor ({ dir, dist }) {
    this.dir = dir
    this.dist = dist
  }

  apply (compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.mainTemplate.plugin('require-ensure', (code) => {
        // Update to load chunks from our custom chunks directory
        const chunksDirPath = join(this.dir, this.dist, 'dist')
        // Make sure even in windows, the path looks like in unix
        // Node.js require system will convert it accordingly
        const chunksDirPathNormalized = chunksDirPath.replace(/\\/g, '/')
        let updatedCode = code.replace('require("./"', `require("${chunksDirPathNormalized}/"`)

        // Replace a promise equivalent which runs in the same loop
        // If we didn't do this webpack's module loading process block us from
        // doing SSR for chunks
        updatedCode = updatedCode.replace(
          'return Promise.resolve();',
          `return require('next/dynamic').SameLoopPromise.resolve();`
        )
        return updatedCode
      })
    })
  }
}