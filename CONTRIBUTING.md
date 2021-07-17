# Project status
This framework is being developed alongside a game. Once the game is production 
ready this framework will be considered beta.

Right now we are still making breaking changes, so this should be considered an
alpha release for people who are interested in tracking the development of this
project. We do not recommend using this for writing production games yet.

# Contributing
If you would like to contribute please contact the authors and discuss your
proposed change before working on your changes or submitting a pull request.

# Development environment
You need to have webpack installed. Webpack requires Node.js.

If you are doing development on Windows then I strongly recommend installing
Windows Subsystem for Linux so that you can run bash scripts.

# Production build
To build this package, run this command:

```bash
NODE_ENV=production npx webpack
```

This will update `frag.min.js` in the `dist` folder with a minified version of the Javascript.

# Development
To build the package in watch mode, run this command:

```bash
NODE_ENV=development npx webpack --watch
```

This will build the production package and source maps into the `dist` folder,
and update them if any source files change.

You can open one of the pages in the `./samples` folder to test specific features
in the framework.
