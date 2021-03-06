import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/programs/1/programyears/1?pyTaxonomyDetails=true';
module('Acceptance: Program Year - Terms', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school', {
      vocabularies: [1],
      programs: [1]
    });
    server.create('vocabulary', {
      terms: [1, 2],
      school: 1,
    });
    server.create('program', {
      programYears: [1]
    });
    server.create('programYear', {
      program: 1,
      terms: [1]
    });
    server.create('cohort');
    server.create('term', {
      programYears: [1],
      vocabulary: 1
    });
    server.create('term', {
      vocabulary: 1
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list terms', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-taxonomies');
    var items = find('ul.selected-taxonomy-terms li', container);
    assert.equal(items.length, 1);
    assert.equal(getElementText(items.eq(0)), getText('term 0'));
  });
});

test('manage terms', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.taxonomy-manager');
    click(find('.actions button', container));
    andThen(function(){
      assert.equal(getElementText(find('.removable-list li:eq(0)', container)), getText('term 0'));
      assert.equal(getElementText(find('.selectable-terms-list li:eq(0)', container)), getText('term 0'));
      assert.equal(getElementText(find('.selectable-terms-list li:eq(1)', container)), getText('term 1'));
    });
  });
});

test('save term changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.taxonomy-manager');
    click(find('.actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-terms-list li:eq(1) > div', container)).then(function(){
          click('button.bigadd', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 1'));
      });
    });
  });
});

test('cancel term changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.taxonomy-manager');
    click(find('.actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-terms-list li:eq(1) > div', container)).then(function(){
          click('button.bigcancel', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 0'));
      });
    });
  });
});
