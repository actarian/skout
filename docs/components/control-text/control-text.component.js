/* jshint esversion: 6 */

import Component from '../component.js';

class ControlTextComponent extends Component {

    static get style() {
        return `
.form-control-input-label {
	color: #000000;
	font-size: 11px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
	text-transform: uppercase;
}

:host>.group>.label {
	display: block;
	position: relative;
	width: 195px;
	height: 11px;
	z-index: 0;
	margin: 0px 21px 0px 0px;
	align-items: flex-start;
}

.form-control-required {
	color: #E2007A;
	font-size: 10px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: right;
	line-height: 1;
	text-transform: uppercase;
}

:host>.group>.required {
	display: block;
	position: relative;
	width: 87px;
	height: 10px;
	z-index: 1;
	align-items: flex-start;
}

:host>.group {
	display: flex;
	position: relative;
	width: 305px;
	height: 11px;
	z-index: 0;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	margin: 0px 0px 8px 0px;
	padding: 0px 1px 0px 1px;
}

:host>.control-input-text {
	display: block;
	position: relative;
	width: 305px;
	height: 50px;
	z-index: 1;
	background: #ffffff;
	background-size: cover;
	border: 2px solid #dcdcdc;
	border-radius: 3px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="group">
	<div class="label stext form-control-input-label"><span>Email</span></div>
	<div class="required stext form-control-required"><span>required</span></div>
</div>
<control-input-text-component class="control-input-text" data="{&quot;value&quot;:{}}"></control-input-text-component>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['label','required','control-input-text'];
    }

}

window.customElements.define('control-text-component', ControlTextComponent);