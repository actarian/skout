/* jshint esversion: 6 */

import Component from '../component.js';

class SectionWhatsappComponent extends Component {

    static get style() {
        return `
:host>.container>.group>.title {
	position: relative;
	width: 100%;
	max-width: 425px;
	min-height: 17px;
	z-index: 1;
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
	position: relative;
	width: 100%;
	max-width: 598px;
	min-height: 50px;
	z-index: 1;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	height: 50px;
}

:host>.container>.group>.btn--icon-label {
	position: relative;
	width: 100%;
	max-width: 150px;
	min-height: 50px;
	z-index: 0;
	padding: 13px 33px 13px 34px;
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
		<div class="title stext"><span>rimani sempre in contatto con whatsapp</span></div>
		<btn--icon-label-component class="btn--icon-label scomponent" data="{&quot;label-icon&quot;:{&quot;btn__label&quot;:&quot;Scrivici&quot;,&quot;icon&quot;:{&quot;scomponent&quot;:&quot;whatsapp&quot;},&quot;scomponent&quot;:&quot;label-icon&quot;},&quot;scomponent&quot;:&quot;btn--icon-label&quot;}"></btn--icon-label-component>
	</div>
</div>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('section--whatsapp-component', SectionWhatsappComponent);