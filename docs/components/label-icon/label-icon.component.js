/* jshint esversion: 6 */

import Component from '../component.js';

class LabelIconComponent extends Component {

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

:host>.group>.btn__label {
	position: relative;
	width: 100%;
	max-width: 51px;
	min-height: 13px;
	z-index: 0;
	transform: rotateZ(-180deg);
	align-items: flex-start;
}

:host>.group {
	position: relative;
	width: 100%;
	max-width: 83px;
	min-height: 24px;
	z-index: 0;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	height: 24px;
	transform: rotateZ(-180deg);
}

:host>.group>.icon {
	position: relative;
	width: 100%;
	max-width: 24px;
	min-height: 24px;
	z-index: 1;
	transform: rotateZ(-180deg);
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="group">
	<div class="btn__label stext btn__label"><span>Scrivici</span></div>
	<icon-component class="icon scomponent" data="{&quot;scomponent&quot;:&quot;whatsapp&quot;}"></icon-component>
</div>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('label-icon-component', LabelIconComponent);