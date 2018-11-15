/* jshint esversion: 6 */

import Component from '../component.js';

class TitleComponent extends Component {

    static get style() {
        return `
.form-title-sup {
	color: #A3A6A8;
	font-size: 16px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
	text-transform: uppercase;
}

:host>.sup {
	position: relative;
	width: 304px;
	height: 16px;
	z-index: 1;
	margin: 0px 0px 3px 0px;
	align-items: flex-start;
}

.form-title-text {
	color: #000000;
	font-size: 26px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
	text-transform: uppercase;
}

:host>.text {
	position: relative;
	width: 304px;
	height: 26px;
	z-index: 0;
	align-items: flex-start;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="sup stext form-title-sup"><span>Sei già registrato?</span></div>
<div class="text stext form-title-text"><span>Accedi</span></div>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['text','sup'];
    }

}

window.customElements.define('title-component', TitleComponent);