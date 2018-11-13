/* jshint esversion: 6 */

import Component from '../component.js';

class PinComponent extends Component {

    static get style() {
        return `
:host > .pin {
    display: block;
    position: relative;
    width: 19px;
    height: 24px;
    z-index: 0; }`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/grid.css"><img class="pin" src="svg/pin.svg">
`;
    }

    static get observedAttributes() {
        return [];
    }

}

window.customElements.define('pin-component', PinComponent);