# HOW to run this sample

This sample needs to serve bitmaps for the ingredient symbols, and the browser won't load them from the file system, so you need to run a local web server as follows:

- Install NodeJS and NPM
- Open a terminal window (MacOS) or command prompt (Windows)
- Run the command `npm install http-server -g`
- Change the current directory to the directory containing the samples (for example `cd samples`)
- Run the command `http-server .`
- Type this into your browser `http://localhost:8080/no-mans-sky/refiner-recipes.html`

You're all set