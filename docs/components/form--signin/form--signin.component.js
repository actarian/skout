/* jshint esversion: 6 */

import Component from '../component.js';

class FormSigninComponent extends Component {

    static get style() {
        return `
:host>.form__head {
	position: relative;
	width: 100%;
	max-width: 305px;
	min-height: 45px;
	z-index: 3;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 0px 0px 34px 0px;
}

:host>.form__control {
	position: relative;
	width: 100%;
	max-width: 305px;
	min-height: 69px;
	z-index: 2;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 0px 0px 21px 0px;
}

:host>.form__control-2 {
	position: relative;
	width: 100%;
	max-width: 305px;
	min-height: 69px;
	z-index: 1;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 0px 0px 60px 0px;
}

:host>.btn--lg {
	position: relative;
	width: 100%;
	max-width: 150px;
	min-height: 50px;
	z-index: 0;
	padding: 19px 17px 18px 18px;
	background: #e2007a;
	background-size: cover;
	border-radius: 25px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<form__head-component class="form__head scomponent" data="{&quot;head__title&quot;:&quot;Accedi&quot;,&quot;head__sup&quot;:&quot;Sei già registrato?&quot;,&quot;scomponent&quot;:&quot;form__head&quot;}"></form__head-component>
<form__control-component class="form__control scomponent" data="{&quot;input--text&quot;:{&quot;input__placeholder&quot;:&quot;Email&quot;,&quot;scomponent&quot;:&quot;input--text&quot;},&quot;control__required&quot;:&quot;required&quot;,&quot;control__label&quot;:&quot;Email&quot;,&quot;scomponent&quot;:&quot;form__control&quot;}"></form__control-component>
<form__control-component class="form__control-2 scomponent" data="{&quot;input--text&quot;:{&quot;input__placeholder&quot;:&quot;Password&quot;,&quot;scomponent&quot;:&quot;input--text&quot;},&quot;control__required&quot;:&quot; &quot;,&quot;control__label&quot;:&quot;password&quot;,&quot;scomponent&quot;:&quot;form__control&quot;}"></form__control-component>
<btn--lg-component class="btn--lg scomponent" data="{&quot;btn__label&quot;:&quot;Accedi&quot;,&quot;scomponent&quot;:&quot;btn--lg&quot;}"></btn--lg-component>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('form--signin-component', FormSigninComponent);