import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('bs-form-element', 'Integration | Component | bs-form-element', {
  integration: true
});

var formLayouts = ['vertical', 'horizontal', 'inline'];

test('component has form-group bootstrap class', function (assert) {
  this.render(hbs`{{bs-form-element}}`);
  assert.equal(this.$(':first-child').hasClass('form-group'), true, 'component has form-group class');
});

test('setting label property displays label tag', function (assert) {
  this.render(hbs`{{bs-form-element label="myLabel"}}`);

  assert.equal(this.$('label').length, 1, 'component has label tag');
  assert.equal(this.$('label').text().trim(), 'myLabel', 'label has text');
});

function controlTypeSupportTest(assert, controlType, selector, values, getValueFn, componentOptions) {
  componentOptions = componentOptions || {};

  if (!Ember.isArray(values)) {
    values = [values];
  }
  values = Ember.A(values);

  this.set('controlType', controlType);
  if (componentOptions.choices) {
    this.set('choices', componentOptions.choices);
  }
  if (componentOptions.choiceLabelProperty) {
    this.set('choiceLabelProperty', componentOptions.choiceLabelProperty);
  }
  if (componentOptions.choiceValueProperty) {
    this.set('choiceValueProperty', componentOptions.choiceValueProperty);
  }

  formLayouts.forEach(layout => {
    this.set('formLayout', layout);
    this.render(hbs`{{#bs-form formLayout=formLayout}}{{bs-form-element controlType=controlType choices=choices choiceLabelProperty=choiceLabelProperty choiceValueProperty=choiceValueProperty value=value}}{{/bs-form}}`);

    assert.equal(this.$(selector).length, 1, 'component has ' + controlType + ' control for form layout ' + layout);

    values.forEach(value => {
      this.set('value', value);
      var hasValue = typeof getValueFn === 'function' ? getValueFn.call(this.$(selector)) : this.$(selector).val();
      assert.equal(hasValue, value, controlType + ' control has correct values for form layout ' + layout);
    });
  });
}

function labeledControlTest(assert, controlType, selector) {
  this.set('controlType', controlType);

  formLayouts.forEach(layout => {
    this.set('formLayout', layout);
    this.render(hbs`{{#bs-form formLayout=formLayout}}{{bs-form-element controlType=controlType label="myLabel"}}{{/bs-form}}`);
    assert.equal(this.$(selector).attr('id'), this.$('label').attr('for'), 'component and label ids do match for form layout ' + layout);
  });
}

test('controlType "text" is supported', function (assert) {
  controlTypeSupportTest.call(this, assert, 'text', 'input[type=text]', 'myValue');
  labeledControlTest.call(this, assert, 'text', 'input[type=text]');
});

test('controlType "checkbox" is supported', function (assert) {
  controlTypeSupportTest.call(this, assert, 'checkbox', 'input[type=checkbox]', [true, false], function () {
    return this.is(':checked');
  });
});

test('controlType "textarea" is supported', function (assert) {
  controlTypeSupportTest.call(this, assert, 'textarea', 'textarea', 'myValue');
  labeledControlTest.call(this, assert, 'textarea', 'textarea');
});


test('controlType "select" is supported', function (assert) {
  var options = {
    choices: Ember.A([
      {
        id: 'f',
        label: 'Female'
      },
      {
        id: 'm',
        label: 'Male'
      }
    ]),
    choiceLabelProperty: 'label',
    choiceValueProperty: 'id'
  };
  controlTypeSupportTest.call(this, assert, 'select', 'select', [options.choices[0], options.choices[1]], function () {
    return options.choices.findBy('id', this.val());
  }, options);
  labeledControlTest.call(this, assert, 'select', 'select');
});


test('Changing formLayout changes markup', function (assert) {
  this.set('formLayout', 'vertical');
  this.render(hbs`{{#bs-form horizontalLabelGridClass="col-sm-4" formLayout=formLayout}}{{bs-form-element controlType="text" label="myLabel"}}{{/bs-form}}`);
  assert.equal(this.$(':first-child').hasClass('form-group'), true, 'component has form-group class');
  assert.equal(this.$(':first-child').children().eq(1).prop('tagName'), 'LABEL', 'first child is a label');
  assert.equal(this.$(':first-child').children().eq(2).prop('tagName'), 'INPUT', 'second child is a input');

  this.set('formLayout', 'horizontal');
  assert.equal(this.$(':first-child').hasClass('form-group'), true, 'component has form-group class');
  assert.equal(this.$(':first-child').children().eq(1).prop('tagName'), 'LABEL', 'first child is a label');
  assert.ok(this.$(':first-child').children().eq(1).hasClass('col-sm-4'), 'label has grid class');
  assert.equal(this.$(':first-child').children().eq(2).prop('tagName'), 'DIV', 'second child is a div');
  assert.ok(this.$(':first-child').children().eq(2).hasClass('col-sm-8'), 'div has grid class');
  assert.equal(this.$(':first-child').children().eq(2).find(':first-child').prop('tagName'), 'INPUT', 'divs first child is an input');
});

test('Custom controls are supported', function (assert) {
  this.set('gender', 'male');
  this.render(hbs`
    {{#bs-form formLayout=formLayout model=this}}
    {{#bs-form-element label="Gender" property="gender" as |value|}}
      <div id="value">{{value}}</div>
    {{/bs-form-element}}
    {{/bs-form}}
  `);

  assert.equal(this.$('#value').length, 1, 'block template is rendered');
  assert.equal(this.$('#value').text().trim(), 'male', 'value is yielded to block template');

});



