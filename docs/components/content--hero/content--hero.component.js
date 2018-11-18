/* jshint esversion: 6 */

import Component from '../component.js';

class ContentHeroComponent extends Component {

    static get style() {
        return `
.hero__title {
	color: #FFFFFF;
	font-size: 32px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: center;
	line-height: 1;
}

:host>.hreo__title {
	position: relative;
	width: 100%;
	max-width: 847px;
	min-height: 32px;
	z-index: 1;
	margin: 0px 0px 25px 0px;
	align-items: flex-start;
}

:host>.control--search {
	position: relative;
	width: 100%;
	max-width: 847px;
	min-height: 72px;
	z-index: 0;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	height: 72px;
	padding: 18px 20px 18px 10px;
	background: #ffffff;
	background-size: cover;
	border-radius: 3px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="hreo__title stext hero__title"><span>Ordina il tuo cibo preferito</span></div>
<control--search-component class="control--search scomponent" data="{&quot;btn--ghost&quot;:{&quot;icon&quot;:{&quot;scomponent&quot;:&quot;pin&quot;},&quot;scomponent&quot;:&quot;btn--ghost&quot;},&quot;input__placeholder&quot;:&quot;Inserisci l’indirizzo&quot;,&quot;btn--md&quot;:{&quot;btn__label&quot;:&quot;cerca&quot;,&quot;scomponent&quot;:&quot;btn--md&quot;},&quot;btn--ghost-2&quot;:{&quot;icon&quot;:{&quot;scomponent&quot;:&quot;crosshair&quot;},&quot;scomponent&quot;:&quot;btn--ghost&quot;},&quot;scomponent&quot;:&quot;control--search&quot;}"></control--search-component>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('content--hero-component', ContentHeroComponent);