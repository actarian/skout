/* jshint esversion: 6 */

import Component from '../component.js';

class ControlSearchComponent extends Component {

    static get style() {
        return `
.search__placeholder {
	color: #A3A6A8;
	font-size: 19px;
	font-family: 'GothamHTF-Book';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
}

:host>.input__placeholder {
	position: relative;
	width: 100%;
	max-width: 603px;
	min-height: 19px;
	z-index: 3;
	align-items: flex-start;
}

:host>.btn--ghost {
	position: relative;
	width: 100%;
	max-width: 36px;
	min-height: 36px;
	z-index: 1;
	padding: 6px 6px 6px 6px;
}

:host>.btn--ghost-2 {
	position: relative;
	width: 100%;
	max-width: 36px;
	min-height: 36px;
	z-index: 2;
	padding: 6px 6px 6px 6px;
}

:host>.btn--md {
	position: relative;
	width: 100%;
	max-width: 112px;
	min-height: 36px;
	z-index: 4;
	padding: 11px 18px 12px 18px;
	background: #e2007a;
	background-size: cover;
	border-radius: 18px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<btn--ghost-component class="btn--ghost scomponent" data="{&quot;icon&quot;:{&quot;scomponent&quot;:&quot;pin&quot;},&quot;scomponent&quot;:&quot;btn--ghost&quot;}"></btn--ghost-component>
<div class="input__placeholder stext search__placeholder"><span>Inserisci l’indirizzo</span></div>
<btn--ghost-component class="btn--ghost-2 scomponent" data="{&quot;icon&quot;:{&quot;scomponent&quot;:&quot;crosshair&quot;},&quot;scomponent&quot;:&quot;btn--ghost&quot;}"></btn--ghost-component>
<btn--md-component class="btn--md scomponent" data="{&quot;btn__label&quot;:&quot;cerca&quot;,&quot;scomponent&quot;:&quot;btn--md&quot;}"></btn--md-component>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('control--search-component', ControlSearchComponent);