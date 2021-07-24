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
To build this package for production release, run this command:

```bash
NODE_ENV=production npx webpack
```

This will update `frag.min.js` and `frag.min.js.map` in the `dist` folder with a minified 
version of the Javascript.

# Development
To build the development package in watch mode, run this command:

```bash
npx webpack --watch
```

This will build the development package and source maps into the `samples` folder,
and update them if any source files change subsequently.

You can use the html pages in the `./samples` folder to test specific features
in the framework to make sure everything is working.

Note that there are no automated tests because its very hard to automatically test
a 3D animated scene for correctness. Make sure you know what all of the samples are
supposed to look like, and test each of the samples before each release.

If you add any new features to the framework, make sure that at least one of the
samples exercises this feature.

There are some unit tests for classes that perform computations. To run these tests
```bash
npm test
```