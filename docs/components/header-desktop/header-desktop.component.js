/* jshint esversion: 6 */

import Component from '../component.js';

class HeaderDesktopComponent extends Component {

    static get style() {
        return `
.header-menu {
	color: #FFFFFF;
	font-size: 16px;
	font-family: 'GothamHTF-Book';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
}

:host>.group>.lavora-con-noi {
	position: relative;
	width: 118px;
	height: 18px;
	z-index: 0;
	margin: 0px 39px 0px 0px;
	align-items: flex-start;
}

.header-menu {
	color: #FFFFFF;
	font-size: 16px;
	font-family: 'GothamHTF-Book';
	letter-spacing: 0;
	text-align: left;
	line-height: 1;
}

:host>.group>.faq {
	position: relative;
	width: 31px;
	height: 18px;
	z-index: 1;
	margin: 0px 325px 0px 0px;
	align-items: flex-start;
}

:host>.group {
	position: relative;
	width: 1280px;
	height: 63px;
	z-index: 0;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
}

:host>.group>.logo-negativo {
	position: relative;
	width: 260px;
	height: 63px;
	z-index: 2;
	margin: 0px 350px 0px 0px;
	padding: -1px 0px 0px 0px;
}

:host>.group>.icon-2 {
	position: relative;
	width: 36px;
	height: 36px;
	z-index: 3;
	margin: 0px 9px 0px 0px;
	background: #e2007a;
	background-size: cover;
	border-radius: 50%;
}

:host>.group>.primary-md {
	position: relative;
	width: 112px;
	height: 36px;
	z-index: 4;
	background: #e2007a;
	background-size: cover;
	border-radius: 18px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<div class="group">
	<div class="lavora-con-noi stext header-menu"><span>Lavora con noi</span></div>
	<div class="faq stext header-menu"><span>Faq</span></div>
	<logo-negativo-component class="logo-negativo scomponent" data="{}"></logo-negativo-component>
	<icon-2-component class="icon-2 scomponent" data="{&quot;icon&quot;:&quot;basket&quot;}"></icon-2-component>
	<primary-md-component class="primary-md scomponent" data="{&quot;label&quot;:&quot;accedi&quot;}"></primary-md-component>
</div>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['lavora-con-noi','faq','logo-negativo','icon-2','primary-md'];
    }

}

window.customElements.define('header-desktop-component', HeaderDesktopComponent);