/* jshint esversion: 6 */

import Component from '../component.js';

class PrimaryMdComponent extends Component {

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
	display: block;
	position: absolute;
	width: 76px;
	height: 13px;
	z-index: 1;
	top: 11px;
	left: 18px;
	align-items: flex-start;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="label stext btn-primary-label"><span>cerca</span></div>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['label'];
    }

}

window.customElements.define('primary-md-component', PrimaryMdComponent);