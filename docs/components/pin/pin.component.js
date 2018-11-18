/* jshint esversion: 6 */

import Component from '../component.js';

class PinComponent extends Component {

    static get style() {
        return `
:host>.pin {
	position: relative;
	width: 100%;
	max-width: 19px;
	min-height: 24px;
	z-index: 0;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css"><img class="pin" src="svg/pin.svg">
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('pin-component', PinComponent);