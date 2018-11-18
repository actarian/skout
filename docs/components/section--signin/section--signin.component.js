/* jshint esversion: 6 */

import Component from '../component.js';

class SectionSigninComponent extends Component {

    static get style() {
        return `
:host>.container>.form--signin {
	position: relative;
	width: 100%;
	max-width: 305px;
	min-height: 348px;
	z-index: 1;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="container">
	<form--signin-component class="form--signin scomponent" data="{&quot;btn--lg&quot;:{&quot;btn__label&quot;:&quot;Accedi&quot;,&quot;scomponent&quot;:&quot;btn--lg&quot;},&quot;form__control&quot;:{&quot;input--text&quot;:{&quot;input__placeholder&quot;:&quot;Email&quot;,&quot;scomponent&quot;:&quot;input--text&quot;},&quot;control__required&quot;:&quot;required&quot;,&quot;control__label&quot;:&quot;Email&quot;,&quot;scomponent&quot;:&quot;form__control&quot;},&quot;form__head&quot;:{&quot;head__title&quot;:&quot;Accedi&quot;,&quot;head__sup&quot;:&quot;Sei già registrato?&quot;,&quot;scomponent&quot;:&quot;form__head&quot;},&quot;form__control-2&quot;:{&quot;input--text&quot;:{&quot;input__placeholder&quot;:&quot;Password&quot;,&quot;scomponent&quot;:&quot;input--text&quot;},&quot;control__required&quot;:&quot; &quot;,&quot;control__label&quot;:&quot;password&quot;,&quot;scomponent&quot;:&quot;form__control&quot;},&quot;scomponent&quot;:&quot;form--signin&quot;}"></form--signin-component>
</div>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('section--signin-component', SectionSigninComponent);