import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';


moduleForComponent('bs-alert', 'Integration | Component | bs-alert', {
  integration: true
});

test('alert has correct CSS classes', function (assert) {
  this.render(hbs`{{#bs-alert type="success"}}Test{{/bs-alert}}`);

  assert.equal(this.$(':first-child').hasClass('alert'), true, 'alert has alert class');
  assert.equal(this.$(':first-child').hasClass('alert-success'), true, 'alert has type class');
});

test('dismissible alert can be hidden by clicking close button', function (assert) {
  this.render(hbs`{{#bs-alert type="success" fade=false}}Test{{/bs-alert}}`);

  assert.equal(this.$().find('button.close').length, 1, 'alert has close button');
  this.$().find('button.close').click();

  assert.equal(this.$(':first-child').hasClass('alert'), false, 'alert has no alert class');
  assert.equal(this.$(':first-child').text().trim(), '', 'alert has no content');

});

test('alert can be hidden by setting visible property', function (assert) {
  this.set('visible', true);
  this.render(hbs`{{#bs-alert type="success" fade=false visible=visible}}Test{{/bs-alert}}`);

  this.set('visible', false);

  assert.equal(this.$(':first-child').hasClass('alert'), false, 'alert has no alert class');
  assert.equal(this.$(':first-child').text().trim(), '', 'alert has no content');

});

test('dismissedAction is called after modal is closed', function (assert) {
  assert.expect(1);

  this.on('testAction', () => {
    assert.ok(true, 'Action has been called.');
  });
  this.render(hbs`{{#bs-alert type="success" fade=false dismissedAction=(action "testAction")}}Test{{/bs-alert}}`);

  this.$().find('button.close').click();
});