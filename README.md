ImpEdit is an app that allows the user to interactively edit impulse responses to a fine level of detail. See it live at [https://montythibault.github.io/ImpEdit/](https://montythibault.github.io/ImpEdit/). Due to the volatility and performance of modern web API's such as WebAudio and WebGL, only Chrome is supported.


This is a completely client-side application that makes use of the Node.js require system and Browserify. Simply run `browserify src/main.js -o build/bundle.js` to convert source to a single file, which is then included in `index.html`.


Node dependencies:

- browserify
- jsfft