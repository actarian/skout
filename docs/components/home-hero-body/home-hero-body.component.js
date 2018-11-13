/* jshint esversion: 6 */

import Component from '../component.js';

class HomeHeroBodyComponent extends Component {

    static get styleUrl() {
        return 'components/home-hero-body/home-hero-body.component.css';
    }

    static get templateUrl() {
        return 'components/home-hero-body/home-hero-body.component.html';
    }

    static get observedAttributes() {
        return ['hero-title', 'search-bar'];
    }

}

window.customElements.define('home-hero-body-component', HomeHeroBodyComponent);