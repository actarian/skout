/* jshint esversion: 6 */

import Component from '../component.js';

class FormControlComponent extends Component {

    static get style() {
        return `
.control__label {
	color: #000000;
	font-size: 11px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
	text-transform: uppercase;
}

:host>.group>.control__label {
	position: relative;
	width: 100%;
	max-width: 195px;
	min-height: 11px;
	z-index: 1;
	align-items: flex-start;
}

.control__required {
	color: #E2007A;
	font-size: 10px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: right;
	line-height: 1;
	text-transform: uppercase;
}

:host>.group>.control__required {
	position: relative;
	width: 100%;
	max-width: 87px;
	min-height: 10px;
	z-index: 0;
	align-items: flex-start;
}

:host>.group {
	position: relative;
	width: 100%;
	max-width: 305px;
	min-height: 11px;
	z-index: 1;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	height: 11px;
	margin: 0px 0px 8px 0px;
	padding: 0px 1px 0px 1px;
}

:host>.input--text {
	position: relative;
	width: 100%;
	max-width: 305px;
	min-height: 50px;
	z-index: 0;
	padding: 16px 14px 18px 15px;
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
	<div class="control__label stext control__label"><span>Email</span></div>
	<div class="control__required stext control__required"><span>required</span></div>
</div>
<input--text-component class="input--text scomponent" data="{&quot;input__placeholder&quot;:&quot;Email&quot;,&quot;scomponent&quot;:&quot;input--text&quot;}"></input--text-component>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('form__control-component', FormControlComponent);