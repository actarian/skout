/* jshint esversion: 6 */

import Component from '../component.js';

class SearchBarComponent extends Component {

    static get styleUrl() {
        return 'components/search-bar/search-bar.component.css';
    }

    static get templateUrl() {
        return 'components/search-bar/search-bar.component.html';
    }

    static get observedAttributes() {
        return ['btn-icon-ghost', 'search-input', 'primary-md'];
    }

}

window.customElements.define('search-bar-component', SearchBarComponent);