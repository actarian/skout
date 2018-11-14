/* jshint esversion: 6 */

import Component from '../component.js';

class HomeHeroBodyComponent extends Component {

    static get style() {
        return `
.search-title {
	color: #FFFFFF;
	font-size: 32px;
	font-family: 'KatahdinRound-Regular';
	letter-spacing: 0;
	text-align: center;
	line-height: 1;
}

:host>.hero-title {
	display: block;
	position: relative;
	width: 847px;
	height: 32px;
	z-index: 0;
	margin: 0px 0px 25px 0px;
	align-items: flex-start;
}

:host>.search-bar {
	display: block;
	position: relative;
	width: 847px;
	height: 72px;
	z-index: 1;
	background: #ffffff;
	background-size: cover;
	border-radius: 3px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="hero-title stext search-title"><span>Ordina il tuo cibo preferito</span></div>
<search-bar-component class="search-bar" data="{&quot;btn-icon-ghost&quot;:&quot;btn-icon-ghost&quot;,&quot;search-input&quot;:&quot;Inserisci l’indirizzo&quot;,&quot;primary-md&quot;:&quot;primary-md&quot;}"></search-bar-component>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['hero-title','search-bar'];
    }

}

window.customElements.define('home-hero-body-component', HomeHeroBodyComponent);