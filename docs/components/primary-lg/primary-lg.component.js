/* jshint esversion: 6 */

import Component from '../component.js';

class PrimaryLgComponent extends Component {

    static get style() {
        return `
.btn-primary-label {
	color: #FFFFFF;
	font-size: 13px;
	font-family: 'GothamHTF-Medium';
	letter-spacing: 1.2px;
	text-align: center;
	line-height: 1;
	text-transform: uppercase;
}

:host>.label {
	position: absolute;
	width: 115px;
	height: 13px;
	z-index: 1;
	top: 19px;
	left: 18px;
	align-items: flex-start;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="label stext btn-primary-label"><span>Accedi</span></div>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['label'];
    }

}

window.customElements.define('primary-lg-component', PrimaryLgComponent);