/* jshint esversion: 6 */

import Component from '../component.js';

class LabelIconLeftComponent extends Component {

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

:host>.group>.label {
	position: relative;
	width: 51px;
	height: 13px;
	z-index: 0;
	margin: 0px 8px 0px 0px;
	transform: rotateZ(-180deg);
	align-items: flex-start;
}

:host>.group {
	position: relative;
	width: 83px;
	height: 24px;
	z-index: 0;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	transform: rotateZ(-180deg);
}

:host>.group>.icon {
	position: relative;
	width: 24px;
	height: 24px;
	z-index: 1;
	transform: rotateZ(-180deg);
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="group">
	<div class="label stext btn-primary-label"><span>Scrivici</span></div>
	<icon-component class="icon scomponent" data="{}"></icon-component>
</div>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['label','icon'];
    }

}

window.customElements.define('label-icon-left-component', LabelIconLeftComponent);