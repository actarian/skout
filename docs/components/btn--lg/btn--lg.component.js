/* jshint esversion: 6 */

import Component from '../component.js';

class BtnLgComponent extends Component {

    static get style() {
        return `
.btn__label {
	color: #FFFFFF;
	font-size: 13px;
	font-family: 'GothamHTF-Medium';
	letter-spacing: 1.2px;
	text-align: center;
	line-height: 1;
	text-transform: uppercase;
}

:host>.btn__label {
	position: relative;
	width: 100%;
	max-width: 115px;
	min-height: 13px;
	z-index: 1;
	align-items: flex-start;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="btn__label stext btn__label"><span>Accedi</span></div>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('btn--lg-component', BtnLgComponent);