/* jshint esversion: 6 */

import Component from '../component.js';

class ClaimWhatsappComponent extends Component {

    static get style() {
        return `
:host>.container>.group>.rimani-sempre-in-con {
	display: block;
	position: relative;
	width: 425px;
	height: 17px;
	z-index: 1;
	margin: 0px 23px 0px 0px;
	align-items: flex-start;
	color: #FFFFFF;
	font-size: 17px;
	font-family: 'GothamHTF-Book';
	letter-spacing: 0;
	text-align: center;
	line-height: 1;
	text-transform: uppercase;
}

:host>.container>.group {
	display: flex;
	position: relative;
	width: 598px;
	height: 50px;
	z-index: 1;
	flex-direction: row;
	justify-content: center;
	align-items: center;
}

:host>.container>.group>.primary-icon-lg {
	display: block;
	position: relative;
	width: 150px;
	height: 50px;
	z-index: 0;
	background: #e2007a;
	background-size: cover;
	border-radius: 25px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="container">
	<div class="group">
		<div class="rimani-sempre-in-con stext"><span>rimani sempre in contatto con whatsapp</span></div>
		<primary-icon-lg-component class="primary-icon-lg" data="{&quot;label-icon-left&quot;:&quot;label-icon-left&quot;}"></primary-icon-lg-component>
	</div>
</div>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['primary-icon-lg','rimani-sempre-in-con'];
    }

}

window.customElements.define('claim-whatsapp-component', ClaimWhatsappComponent);