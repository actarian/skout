/* jshint esversion: 6 */

import Component from '../component.js';

class SectionHeroComponent extends Component {

    static get style() {
        return `
:host>.overlay {
	position: absolute;
	width: 100%;
	max-width: 1440px;
	min-height: 332px;
	z-index: 1;
	top: 0;
	left: 0;
	background: linear-gradient(-180deg, #000000 0%, rgba(0, 0, 0, 0.00) 100%);
	background-size: cover;
	border-radius: 0;
	display: inline-block;
}

:host>.container>.content--hero {
	position: relative;
	width: 100%;
	max-width: 847px;
	min-height: 129px;
	z-index: 2;
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
<div class="overlay"></div>
<div class="container">
	<content--hero-component class="content--hero scomponent" data="{&quot;control--search&quot;:{&quot;btn--ghost&quot;:{&quot;icon&quot;:{&quot;scomponent&quot;:&quot;pin&quot;},&quot;scomponent&quot;:&quot;btn--ghost&quot;},&quot;input__placeholder&quot;:&quot;Inserisci l’indirizzo&quot;,&quot;btn--md&quot;:{&quot;btn__label&quot;:&quot;cerca&quot;,&quot;scomponent&quot;:&quot;btn--md&quot;},&quot;btn--ghost-2&quot;:{&quot;icon&quot;:{&quot;scomponent&quot;:&quot;crosshair&quot;},&quot;scomponent&quot;:&quot;btn--ghost&quot;},&quot;scomponent&quot;:&quot;control--search&quot;},&quot;hreo__title&quot;:&quot;Ordina il tuo cibo preferito&quot;,&quot;scomponent&quot;:&quot;content--hero&quot;}"></content--hero-component>
</div>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('section--hero-component', SectionHeroComponent);