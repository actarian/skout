/* jshint esversion: 6 */

import Component from '../component.js';

class InputTextComponent extends Component {

    static get style() {
        return `
.input__placeholder {
	color: #7F7F7F;
	font-size: 16px;
	font-family: 'GothamHTF-Book';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
}

:host>.input__placeholder {
	position: relative;
	width: 100%;
	max-width: 276px;
	min-height: 16px;
	z-index: 1;
	align-items: flex-start;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="input__placeholder stext input__placeholder"><span>Email</span></div>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('input--text-component', InputTextComponent);