/* jshint esversion: 6 */

import Component from '../component.js';

class FormHeadComponent extends Component {

    static get style() {
        return `
.head__sup {
	color: #A3A6A8;
	font-size: 16px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
	text-transform: uppercase;
}

:host>.head__sup {
	position: relative;
	width: 100%;
	max-width: 304px;
	min-height: 16px;
	z-index: 1;
	margin: 0px 0px 3px 0px;
	align-items: flex-start;
}

.head__title {
	color: #000000;
	font-size: 26px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
	text-transform: uppercase;
}

:host>.head__title {
	position: relative;
	width: 100%;
	max-width: 304px;
	min-height: 26px;
	z-index: 0;
	align-items: flex-start;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="head__sup stext head__sup"><span>Sei già registrato?</span></div>
<div class="head__title stext head__title"><span>Accedi</span></div>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('form__head-component', FormHeadComponent);