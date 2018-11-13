/* jshint esversion: 6 */

import Component from '../component.js';

class HeaderDesktopComponent extends Component {

    static get styleUrl() {
        return 'components/header-desktop/header-desktop.component.css';
    }

    static get templateUrl() {
        return 'components/header-desktop/header-desktop.component.html';
    }

    static get observedAttributes() {
        return ['lavora-con-noi', 'faq', 'logo-negativo', 'icon-2', 'primary-md'];
    }

}

window.customElements.define('header-desktop-component', HeaderDesktopComponent);