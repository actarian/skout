# ![Skout! Settings](assets/favicon.ico) Skout! — Sketch Plugin

[![Download from Sketchpacks.com](https://badges.sketchpacks.com/plugins/com.circledev.skout/version.svg)](https://api.sketchpacks.com/v1/plugins/com.circledev.skout/download) 
[![Compatible Sketch Version](https://badges.sketchpacks.com/plugins/com.circledev.skout/compatibility.svg)](https://sketchpacks.com/circledev/skout)

*Skout! is a Sketch plugin to export selected artboard to a web ready mockup.*

*Skout is currently in active development.*

*With Skout you can:*

<!--
<a href="https://www.sketchapp.com"><img width="160" height="41" src="images/sketch-badge.png"></a>
<a href="http://bit.ly/SketchRunnerWebsite"><img width="160" height="41" src="http://sketchrunner.com/img/badge_blue.png"></a>
-->

* Export to html, css, images and svg.
* Export stylesheets with custom grids and css vars.
* Export to web components.
* Launch page preview through [http-server](https://www.npmjs.com/package/http-server) ([npm](https://nodejs.org) required)

![Skout! Settings](example/settings.png)

___

## Features

| ![Skout! Settings](assets/favicon.ico) | Description |
| --- | --- |
| **Responsive / Exact** | Select between a responsive or exact layout |
| **Html / Css / Images / Svg / Components** | Select the assets you want to export |
| **Exported / Inline** | Select imported or inline stylesheets |
| **Single file / Extracted** | Select single file or extracted component |
| **Launch** | Launch in browser [npm](https://nodejs.org) required |
___

## Demo

* View an example output page [here](https://actarian.github.io/skout/)
* Download the example's sketch file [here](example/mockup.sketch)
___

## Purpose

Skout plugin does _not_ generate production ready web pages. 

Skout plugin generates a structured mockup from your design to help you start developing faster.

___

## Installation

1. [Download the plugin](https://api.sketchpacks.com/v1/plugins/com.circledev.skout/download)
2. Double-click to install `skout.sketchplugin`
3. Select an artboard
4. Press ctrl + cmd ⌘ + S

___

## Contributing

*Pull requests are welcome and please submit bugs 🐞*

*Thank you for taking the time to provide feedback and review. This feedback is appreciated and very helpful 🌈*

[Github Project Page](https://github.com/actarian/skout)  
[Sketchpacks.com](https://api.sketchpacks.com/v1/plugins/com.circledev.skout/download)

*If you find this plugin helpful,   
feel free to contribute in keeping this plugin up to date via [PayPal](https://www.paypal.me/circledev/5)*

[![PayPal](https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png)](https://www.paypal.me/circledev/5)
___

## Contact

* Luca Zampetti <lzampetti@gmail.com>
* Follow [@actarian](https://twitter.com/actarian) on Twitter

[![Twitter Follow](https://img.shields.io/twitter/follow/actarian.svg?style=social&label=Follow)]()

---
## Requirements

* Sketch.app v 52.0.
___

## Todo

* BEM naming conversion to web elements.
___

## Release Notes
Changelog [here](https://github.com/actarian/skout/blob/master/CHANGELOG.md).

### 0.1.1

* Initial release of skout plugin for sketch.

___


_This plugin was created using `skpm`. For a detailed explanation on how things work, checkout the [skpm Readme](https://github.com/skpm/skpm/blob/master/README.md)._
___
### Node

`sudo npm install -g skpm --unsafe-perm`

To start a development live-reload build
  `npm run start`

To build the plugin
  `npm run build`
___
### Usage

Install the dependencies

```bash
npm install
```

Once the installation is done, you can run some commands inside the project folder:

```bash
npm run build
```

To watch for changes:

```bash
npm run watch
```

Additionally, if you wish to run the plugin every time it is built:

```bash
npm run start
```
___
### Help

[developer.sketchapp.com/guides/preferences](https://developer.sketchapp.com/guides/preferences/)
