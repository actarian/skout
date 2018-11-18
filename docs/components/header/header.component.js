/* jshint esversion: 6 */

import Component from '../component.js';

class HeaderComponent extends Component {

    static get style() {
        return `
.nav--item {
	color: #FFFFFF;
	font-size: 16px;
	font-family: 'GothamHTF-Book';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
}

:host>.group>.nva--item {
	position: relative;
	width: 100%;
	max-width: 118px;
	min-height: 18px;
	z-index: 0;
	align-items: flex-start;
}

.nav--item {
	color: #FFFFFF;
	font-size: 16px;
	font-family: 'GothamHTF-Book';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
}

:host>.group>.nva--item-2 {
	position: relative;
	width: 100%;
	max-width: 31px;
	min-height: 18px;
	z-index: 1;
	align-items: flex-start;
}

:host>.group {
	position: relative;
	width: 100%;
	max-width: 1280px;
	min-height: 63px;
	z-index: 0;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	height: 63px;
}

:host>.group>.icon-2 {
	position: relative;
	width: 100%;
	max-width: 260px;
	min-height: 63px;
	z-index: 2;
	padding: -1px 0px 0px 0px;
}

:host>.group>.btn--icon {
	position: relative;
	width: 100%;
	max-width: 36px;
	min-height: 36px;
	z-index: 3;
	padding: 6px 6px 6px 6px;
	background: #e2007a;
	background-size: cover;
	border-radius: 50%;
}

:host>.group>.btn--md {
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
<div class="group container">
	<div class="nva--item stext nav--item"><span>Lavora con noi</span></div>
	<div class="nva--item-2 stext nav--item"><span>Faq</span></div>
	<icon-2-component class="icon-2 scomponent" data="{&quot;scomponent&quot;:&quot;icon-2&quot;}"></icon-2-component>
	<btn--icon-component class="btn--icon scomponent" data="{&quot;icon&quot;:{&quot;scomponent&quot;:&quot;basket&quot;},&quot;scomponent&quot;:&quot;btn--icon&quot;}"></btn--icon-component>
	<btn--md-component class="btn--md scomponent" data="{&quot;btn__label&quot;:&quot;accedi&quot;,&quot;scomponent&quot;:&quot;btn--md&quot;}"></btn--md-component>
</div>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('header-component', HeaderComponent);