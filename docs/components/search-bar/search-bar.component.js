/* jshint esversion: 6 */

import Component from '../component.js';

class SearchBarComponent extends Component {

    static get style() {
        return `
.search-input-placeholder {
	color: #A3A6A8;
	font-size: 19px;
	font-family: 'GothamHTF-Book';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
}

:host>.search-input {
	position: absolute;
	width: 603px;
	height: 19px;
	z-index: 3;
	top: 25px;
	left: 60px;
	align-items: flex-start;
}

:host>.btn-icon-ghost {
	position: absolute;
	width: 36px;
	height: 36px;
	z-index: 1;
	top: 18px;
	left: 10px;
	padding: 6px 6px 6px 6px;
}

:host>.btn-icon-ghost-2 {
	position: absolute;
	width: 36px;
	height: 36px;
	z-index: 2;
	top: 18px;
	left: 679px;
	padding: 6px 6px 6px 6px;
}

:host>.primary-md {
	position: absolute;
	width: 112px;
	height: 36px;
	z-index: 4;
	top: 18px;
	left: 715px;
	background: #e2007a;
	background-size: cover;
	border-radius: 18px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<btn-icon-ghost-component class="btn-icon-ghost scomponent" data="{&quot;icon&quot;:&quot;pin&quot;}"></btn-icon-ghost-component>
<btn-icon-ghost-component class="btn-icon-ghost-2 scomponent" data="{&quot;icon&quot;:&quot;crosshair&quot;}"></btn-icon-ghost-component>
<primary-md-component class="primary-md scomponent" data="{&quot;label&quot;:{}}"></primary-md-component>
<div class="search-input stext search-input-placeholder"><span>Inserisci l’indirizzo</span></div>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['btn-icon-ghost','search-input','primary-md'];
    }

}

window.customElements.define('search-bar-component', SearchBarComponent);