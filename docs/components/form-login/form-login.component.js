/* jshint esversion: 6 */

import Component from '../component.js';

class FormLoginComponent extends Component {

    static get style() {
        return `
:host>.title {
	position: relative;
	width: 305px;
	height: 45px;
	z-index: 3;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 0px 0px 34px 0px;
}

:host>.control-text {
	position: relative;
	width: 305px;
	height: 69px;
	z-index: 1;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 0px 0px 21px 0px;
}

:host>.control-text-2 {
	position: relative;
	width: 305px;
	height: 69px;
	z-index: 2;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 0px 0px 60px 0px;
}

:host>.primary-lg {
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
<title-component class="title scomponent" data="{&quot;text&quot;:{},&quot;sup&quot;:{}}"></title-component>
<control-text-component class="control-text scomponent" data="{&quot;label&quot;:{},&quot;required&quot;:&quot;required&quot;,&quot;control-input-text&quot;:&quot;control-input-text&quot;}"></control-text-component>
<control-text-component class="control-text-2 scomponent" data="{&quot;label&quot;:{},&quot;required&quot;:{},&quot;control-input-text&quot;:&quot;control-input-text&quot;}"></control-text-component>
<primary-lg-component class="primary-lg scomponent" data="{&quot;label&quot;:{}}"></primary-lg-component>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['primary-lg','control-text','title'];
    }

}

window.customElements.define('form-login-component', FormLoginComponent);