/* jshint esversion: 6 */

import Component from '../component.js';

class HomeHeroComponent extends Component {

    static get style() {
        return `
:host > .rectangle {
    display: inline-block;
    position: absolute;
    width: 100%;
    height: 332px;
    z-index: 1;
    top: 0;
    left: 0;
    background: linear-gradient(-180deg, #000000 0%, rgba(0,0,0,0.00) 100%);
    background-size: cover;
    border-radius: 0; }

:host > .container > .home-hero-body {
    display: flex;
    position: relative;
    width: 847px;
    height: 129px;
    z-index: 2;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start; }`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/grid.css">
<div class="rectangle"></div>
<div class="container">
	<home-hero-body-component class="home-hero-body"></home-hero-body-component>
</div>
`;
    }

    static get observedAttributes() {
        return ['home-hero-body'];
    }

}

window.customElements.define('home-hero-component', HomeHeroComponent);