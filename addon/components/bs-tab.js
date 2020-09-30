import { tagName } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { filter, oneWay } from '@ember/object/computed';
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { A } from '@ember/array';
import ComponentParent from 'ember-bootstrap/mixins/component-parent';
import TabPane from 'ember-bootstrap/components/bs-tab/pane';
import listenTo from 'ember-bootstrap/utils/cp/listen-to';
import defaultValue from 'ember-bootstrap/utils/default-decorator';
import deprecateSubclassing from 'ember-bootstrap/utils/deprecate-subclassing';

/**
  Tab component for dynamic tab functionality that mimics the behaviour of Bootstrap's tab.js plugin,
  see http://getbootstrap.com/javascript/#tabs

  ### Usage

  Just nest any number of yielded [Components.TabPane](Components.TabPane.html) components that hold the tab content.
  The tab navigation is automatically generated from the tab panes' `title` property:

  ```hbs
  <BsTab as |tab|>
    <tab.pane @title="Tab 1">
      <p> ... </p>
    </tab.pane>
    <tab.pane @title="Tab 2">
      <p> ... </p>
    </tab.pane>
  </BsTab>
  ```

  ### Groupable (dropdown) tabs

  Bootstrap's support for dropdown menus as tab navigation is mimiced by the use of the `groupTitle` property.
  All panes with the same `groupTitle` will be put inside the menu of a [Components.Dropdown](Components.Dropdown.html)
  component with `groupTitle` being the dropdown's title:

  ```hbs
  <BsTab as |tab|>
    <tab.pane @title="Tab 1">
      <p> ... </p>
    </tab.pane>
    <tab.pane @title="Tab 2">
      <p> ... </p>
    </tab.pane>
    <tab.pane @title="Tab 3" @groupTitle="Dropdown">
      <p> ... </p>
    </tab.pane>
    <tab.pane @title="Tab 4" @groupTitle="Dropdown">
      <p> ... </p>
    </tab.pane>
  </BsTab>
  ```

  ### Custom tabs

  When having the tab pane's `title` as the tab navigation title is not sufficient, for example because you want to
  integrate some other dynamic content, maybe even other components in the tab navigation item, then you have to setup
  your navigation by yourself.

  Set `customTabs` to true to deactivate the automatic tab navigation generation. Then setup your navigation, probably
  using a [Components.Nav](Components.Nav.html) component. The tab component yields the `activeId` property as well as
  its `select` action, which you would have to use to manually set the `active` state of the navigation items and to
  trigger the selection of the different tab panes, using their ids:

  ```hbs
  <BsTab @customTabs={{true}} as |tab|>
    <BsNav @type="tabs" as |nav|>
      <nav.item @active={{bs-eq Tab.activeId "pane1"}}><a href="#pane1" role="tab" onclick={{action Tab.select "pane1"}}>Tab 1</a></nav.item>
      <nav.item @active={{bs-eq Tab.activeId "pane2"}}><a href="#pane2" role="tab" onclick={{action Tab.select "pane2"}}>Tab 2 <span class="badge">{{badge}}</span></a></nav.item>
    </BsNav>
    <div class="tab-content">
      <tab.pane @id="pane1" @title="Tab 1">
        <p> ... </p>
      </tab.pane>
      <tab.pane @id="pane2" @title="Tab 2">
        <p> ... </p>
      </tab.pane>
    </div>
  </BsTab>
  ```

  Note that the `bs-eq` helper used in the example above is a private helper, which is not guaranteed to be available for
  the future. Better use the corresponding `eq` helper of the
  [ember-truth-helpers](https://github.com/jmurphyau/ember-truth-helpers) addon for example!

  ### Routable tabs

  The tab component purpose is to have panes of content, that are all in DOM at the same time and that are activated and
  deactivated dynamically, just as the  original Bootstrap implementation.

  If you want to have the content delivered through individual sub routes, just use
  the [Components.Nav](Components.Nav.html) component and an `{{outlet}}` that show the nested routes' content:

  ```hbs
  <div>
    <BsNav @type="tabs" as |nav|>
      <nav.item>
        <nav.linkTo @route="tabs.index">Tab 1</nav.linkTo>
      </nav.item>
      <nav.item>
        <nav.linkTo @route="tabs.other">Tab 3</nav.linkTo>
      </nav.item>
    </BsNav>
  </div>
  ```

  *Note that only invoking the component in a template as shown above is considered part of its public API. Extending from it (subclassing) is generally not supported, and may break at any time.*

  @class Tab
  @namespace Components
  @extends Ember.Component
  @uses Mixins.ComponentParent
  @public
*/
@tagName('')
@deprecateSubclassing
export default class Tab extends Component.extend(ComponentParent) {
  /**
   * Type of nav, either "pills" or "tabs"
   *
   * @property type
   * @type String
   * @default 'tabs'
   * @public
   */
  @defaultValue
  type = 'tabs';

  /**
   * @property paneComponent
   * @type {String}
   * @private
   */

  /**
   * @property navComponent
   * @type {String}
   * @private
   */

  /**
   * By default the tabs will be automatically generated using the available [TabPane](Components.TabPane.html)
   * components. If set to true, you can deactivate this and setup the tabs manually. See the example above.
   *
   * @property customTabs
   * @type boolean
   * @default false
   * @public
   */
  @defaultValue
  customTabs = false;

  /**
   * The id (`id`) of the active [TabPane](Components.TabPane.html).
   * By default the first tab will be active, but this can be changed by setting this property
   *
   * ```hbs
   * {{#bs-tab activeId="pane2"}}
   *   {{#tab.pane id="pane1" title="Tab 1"}}
   *      ...
   *   {{/tab.pane}}
   *   {{#tab.pane id="pane1" title="Tab 1"}}
   *     ...
   *   {{/tab.pane}}
   * {{/bs-tab}}
   * ```
   *
   * When the selection is changed by user interaction this property will not update by using two-way bindings in order
   * to follow DDAU best practices. If you want to react to such changes, subscribe to the `onChange` action
   *
   * @property activeId
   * @type string
   * @public
   */
  @oneWay('childPanes.firstObject.id')
  activeId;

  /**
   * @property isActiveId
   * @private
   */
  @listenTo('activeId')
  isActiveId;

  /**
   * Set to false to disable the fade animation when switching tabs.
   *
   * @property fade
   * @type boolean
   * @default true
   * @public
   */
  @defaultValue
  fade = true;

  /**
   * The duration of the fade animation
   *
   * @property fadeDuration
   * @type integer
   * @default 150
   * @public
   */
  @defaultValue
  fadeDuration = 150;

  /**
   * This action is called when switching the active tab, with the new and previous pane id
   *
   * You can return false to prevent changing the active tab automatically, and do that in your action by
   * setting `activeId`.
   *
   * @event onChange
   * @public
   */
  onChange() {}

  /**
   * All `TabPane` child components
   *
   * @property childPanes
   * @type array
   * @readonly
   * @private
   */
  @filter('children', function (view) {
    return view instanceof TabPane;
  })
  childPanes;

  /**
   * Array of objects that define the tab structure
   *
   * @property navItems
   * @type array
   * @readonly
   * @private
   */
  @computed('childPanes.@each.{id,title,group}')
  get navItems() {
    let items = A();
    this.childPanes.forEach((pane) => {
      let groupTitle = pane.get('groupTitle');
      let item = pane.getProperties('id', 'title');
      if (isPresent(groupTitle)) {
        let group = items.findBy('groupTitle', groupTitle);
        if (group) {
          group.children.push(item);
          group.childIds.push(item.id);
        } else {
          items.push({
            isGroup: true,
            groupTitle,
            children: A([item]),
            childIds: A([item.id]),
          });
        }
      } else {
        items.push(item);
      }
    });
    return items;
  }

  @action
  select(id) {
    let previous = this.isActiveId;
    if (this.onChange(id, previous) !== false) {
      // change active tab when `onChange` does not return false
      this.set('isActiveId', id);
    }
  }
}
