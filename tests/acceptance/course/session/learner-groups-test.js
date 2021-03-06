
import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/courses/1/sessions/1?sessionLearnergroupDetails=true';
module('Acceptance: Session - Learner Groups', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, {
      id: 4136,
      school: 1
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

let setupModels = function(){
  server.create('school', {
    courses: [1]
  });
  server.create('course', {
    school: 1,
    sessions: [1],
    cohorts: [1],
  });
  server.create('sessionType', {
    sessions: [1]
  });
  server.create('program', {
    programYears: [1],
    school: 1
  });
  server.create('programYear', {
    cohort: 1
  });
  server.create('cohort', {
    learnerGroups: [1, 2, 3, 4, 5, 6, 7, 8],
    courses: [1],
    programYear: 1
  });
  server.createList('learnerGroup', 2, {
    ilmSessions: [1],
    cohort: 1
  });
  server.create('learnerGroup', {
    cohort: 1
  });
  server.create('learnerGroup', {
    ilmSessions: [1],
    cohort: 1,
    children: [6, 7]
  });
  server.create('learnerGroup', {
    cohort: 1,
    children: [8]
  });
  server.createList('learnerGroup', 2, {
    cohort: 1,
    parent: 4
  });
  server.createList('learnerGroup', 2, {
    cohort: 1,
    parent: 5
  });
  server.create('session', {
    course: 1,
    ilmSession: 1,
  });
};

test('initial selected learner groups', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });

  const container = '.detail-learnergroups ';
  const set1 = container + 'fieldset:eq(0)';
  const set1Legend = set1 + ' legend';
  const set1Group1 = set1 + ' li:eq(0)';
  const set2 = container + 'fieldset:eq(1)';
  const set2Legend = set2 + ' legend';
  const set2Group1 = set2 + ' li:eq(0)';
  const set3 = container + 'fieldset:eq(2)';
  const set3Legend = set3 + ' legend';
  const set3Group1 = set3 + ' li:eq(0)';

  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(set1Legend)), getText('learnergroup 0 (program0 cohort0)'));
    assert.equal(getElementText(find(set2Legend)), getText('learnergroup 1 (program0 cohort0)'));
    assert.equal(getElementText(find(set3Legend)), getText('learnergroup 3 (program0 cohort0)'));

    assert.equal(getElementText(find(set1Group1)), getText('learnergroup 0 (0)'));
    assert.equal(getElementText(find(set2Group1)), getText('learnergroup 1 (0)'));
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 3 (0)'));

  });
});

test('learner group manager display', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  const container = '.detail-learnergroups ';
  const set1 = container + 'fieldset:eq(0)';
  const set1Legend = set1 + ' legend';
  const set1Group1 = set1 + ' li:eq(0)';
  const set2 = container + 'fieldset:eq(1)';
  const set2Legend = set2 + ' legend';
  const set2Group1 = set2 + ' li:eq(0)';
  const set3 = container + 'fieldset:eq(2)';
  const set3Legend = set3 + ' legend';
  const set3Group1 = set3 + ' li:eq(0)';

  visit(url + '&isManagingLearnerGroups=true');
  const availableLearnerGroups = '.detail-learnergroups .tree-groups-list';
  andThen(function() {

    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(availableLearnerGroups).children(':visible')), getText('learnergroup 2 learnergroup 3 learnergroup 5  learnergroup 6  learnergroup 4  learnergroup 7'));

    assert.equal(getElementText(find(set1Legend)), getText('learnergroup 0 (program0 cohort0)'));
    assert.equal(getElementText(find(set2Legend)), getText('learnergroup 1 (program0 cohort0)'));
    assert.equal(getElementText(find(set3Legend)), getText('learnergroup 3 (program0 cohort0)'));

    assert.equal(getElementText(find(set1Group1)), getText('learnergroup 0 (0)'));
    assert.equal(getElementText(find(set2Group1)), getText('learnergroup 1 (0)'));
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 3 (0)'));
  });
});

test('learner group manager display with no selected groups', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: []
  });
  const container = '.detail-learnergroups ';
  const selectedLearnerGroups = container + ' .selected-learner-groups';

  visit(url + '&isManagingLearnerGroups=true');
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(selectedLearnerGroups)), getText('Selected Learner Groups None'));
  });
});

test('filter learner groups by top group should include all subgroups', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  visit(url + '&isManagingLearnerGroups=true');
  fillIn('.search-box input', 3);
  const availableLearnerGroups = '.detail-learnergroups .tree-groups-list';
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(availableLearnerGroups).children(':visible')), getText('learnergroup 3 learnergroup 5 learnergroup 6'));
  });
});

test('filter learner groups by subgroup should include top group', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  visit(url + '&isManagingLearnerGroups=true');
  const lg3 = '.detail-learnergroups .tree-groups-list li:eq(3)';
  const lg5 = '.detail-learnergroups .tree-groups-list li:eq(4)';
  const lg6 = '.detail-learnergroups .tree-groups-list li:eq(5)';
  andThen(function() {
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':visible'));
  });
  fillIn('.search-box input', 5);
  andThen(function() {
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':hidden'));
  });
});

test('add learner group', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  const container = '.detail-learnergroups ';
  const set3 = container + 'fieldset:eq(2)';
  const set3Legend = set3 + ' legend';
  const set3Group1 = set3 + ' li:eq(0)';

  visit(url + '&isManagingLearnerGroups=true');
  const lg2 = '.detail-learnergroups .tree-groups-list li:eq(2)';
  const lg2Clicker = lg2 + ' .clickable';
  andThen(function() {
    assert.ok(find(lg2).is(':visible'));
  });
  click(lg2Clicker);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(set3Legend)), getText('learnergroup 2 (program0 cohort0)'));
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 2 (0)'));
    assert.ok(find(lg2).is(':hidden'));

  });
});

test('add learner sub group', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  const container = '.detail-learnergroups ';
  const set3 = container + 'fieldset:eq(2)';
  const set3Group1 = set3 + ' li:eq(0)';
  const set3Group2 = set3 + ' li:eq(1)';
  const lg5 = '.detail-learnergroups .tree-groups-list li:eq(4)';
  const lg5Clicker = lg5 + ' .clickable';

  visit(url + '&isManagingLearnerGroups=true');
  andThen(function() {
    assert.ok(find(lg5).is(':visible'));
  });
  click(lg5Clicker);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.ok(find(lg5).is(':hidden'));
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 3 (0)'));
    assert.equal(getElementText(find(set3Group2)), getText('learnergroup 5 (0)'));
  });
});

test('add learner group with children', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  visit(url + '&isManagingLearnerGroups=true');
  const container = '.detail-learnergroups ';
  const set3 = container + 'fieldset:eq(2)';
  const set3Group1 = set3 + ' li:eq(0)';
  const set3Group2 = set3 + ' li:eq(1)';
  const set3Group3 = set3 + ' li:eq(2)';
  const lg3 = '.detail-learnergroups .tree-groups-list li:eq(3)';
  const lg5 = '.detail-learnergroups .tree-groups-list li:eq(4)';
  const lg6 = '.detail-learnergroups .tree-groups-list li:eq(5)';
  const lg3Clicker = lg3 + ' .clickable';
  andThen(function() {
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':visible'));
  });
  click(lg3Clicker);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 3 (0)'));
    assert.equal(getElementText(find(set3Group2)), getText('learnergroup 5 (0)'));
    assert.equal(getElementText(find(set3Group3)), getText('learnergroup 6 (0)'));
    assert.ok(find(lg3).is(':hidden'));
    assert.ok(find(lg5).is(':hidden'));
    assert.ok(find(lg6).is(':hidden'));
  });
});

test('add learner group with children and remove one child', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  visit(url + '&isManagingLearnerGroups=true');
  const container = '.detail-learnergroups ';
  const set3 = container + 'fieldset:eq(2)';
  const set3Group1 = set3 + ' li:eq(0)';
  const set3Group2 = set3 + ' li:eq(1)';
  const set3Group3 = set3 + ' li:eq(2)';
  const lg3 = '.detail-learnergroups .tree-groups-list li:eq(3)';
  const lg5 = '.detail-learnergroups .tree-groups-list li:eq(4)';
  const lg6 = '.detail-learnergroups .tree-groups-list li:eq(5)';
  const lg3Clicker = lg3 + ' .clickable';
  andThen(function() {
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':visible'));
  });
  click(lg3Clicker);
  andThen(function() {
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 3 (0)'));
    assert.equal(getElementText(find(set3Group2)), getText('learnergroup 5 (0)'));
    assert.equal(getElementText(find(set3Group3)), getText('learnergroup 6 (0)'));
    assert.ok(find(lg3).is(':hidden'));
    assert.ok(find(lg5).is(':hidden'));
    assert.ok(find(lg6).is(':hidden'));
  });
  click(set3Group2);
  andThen(function() {
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 3 (0)'));
    assert.equal(getElementText(find(set3Group2)), getText('learnergroup 6 (0)'));
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':hidden'));
  });

});

test('undo learner group change', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  visit(url + '&isManagingLearnerGroups=true');
  const container = '.detail-learnergroups ';
  const lg7 = container + '.available-learner-groups li:eq(7) .clickable';
  const cancel = container + '.bigcancel';
  const set1 = container + 'fieldset:eq(0)';
  const set1Legend = set1 + ' legend';
  const set1Group1 = set1 + ' li:eq(0)';
  const set1RemoveAll = set1 + ' .remove';
  const set2 = container + 'fieldset:eq(1)';
  const set2Legend = set2 + ' legend';
  const set2Group1 = set2 + ' li:eq(0)';
  const set3 = container + 'fieldset:eq(2)';
  const set3Legend = set3 + ' legend';
  const set3Group1 = set3 + ' li:eq(0)';

  click(set1RemoveAll);
  click(lg7);
  click(cancel);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');

    assert.equal(getElementText(find(set1Legend)), getText('learnergroup 0 (program0 cohort0)'));
    assert.equal(getElementText(find(set2Legend)), getText('learnergroup 1 (program0 cohort0)'));
    assert.equal(getElementText(find(set3Legend)), getText('learnergroup 3 (program0 cohort0)'));

    assert.equal(getElementText(find(set1Group1)), getText('learnergroup 0 (0)'));
    assert.equal(getElementText(find(set2Group1)), getText('learnergroup 1 (0)'));
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 3 (0)'));
  });
});

test('save learner group change', function(assert) {
  setupModels();
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  visit(url + '&isManagingLearnerGroups=true');
  const container = '.detail-learnergroups ';
  const lg7 = container + '.available-learner-groups li:eq(7) .clickable';
  const save = container +  '.bigadd';
  const set1 = container +  'fieldset:eq(0)';
  const set1Legend = set1 + ' legend';
  const set1Group1 = set1 + ' li:eq(0)';
  const set1RemoveAll = set1 + ' .remove';
  const set2 = container +  'fieldset:eq(1)';
  const set2Legend = set2 + ' legend';
  const set2Group1 = set2 + ' li:eq(0)';
  const set3 = container +  'fieldset:eq(2)';
  const set3Legend = set3 + ' legend';
  const set3Group1 = set3 + ' li:eq(0)';
  const set3Group2 = set3 + ' li:eq(1)';

  click(set1RemoveAll);
  click(lg7);
  click(save);
  andThen(function() {
    assert.equal(getElementText(find(set1Legend)), getText('learnergroup 1 (program0 cohort0)'));
    assert.equal(getElementText(find(set2Legend)), getText('learnergroup 3 (program0 cohort0)'));
    assert.equal(getElementText(find(set3Legend)), getText('learnergroup 4 (program0 cohort0)'));

    assert.equal(getElementText(find(set1Group1)), getText('learnergroup 1 (0)'));
    assert.equal(getElementText(find(set2Group1)), getText('learnergroup 3 (0)'));
    assert.equal(getElementText(find(set3Group1)), getText('learnergroup 4 (0)'));
    assert.equal(getElementText(find(set3Group2)), getText('learnergroup 7 (0)'));
  });
});

test('collapsed learner groups', function(assert) {
  setupModels();
  server.create('programYear', {
    cohort: 2,
    program: 1
  });
  server.create('cohort', {
    learnerGroups: [9, 10],
    courses: [1],
    programYear: 2
  });
  server.createList('learnerGroup', 2, {
    ilmSessions: [1],
    cohort: 2
  });
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4, 10, 11]
  });

  const cohort1Title = 'table tr:eq(1) td:eq(0)';
  const cohort1Count = 'table tr:eq(1) td:eq(1)';
  const cohort2Title = 'table tr:eq(2) td:eq(0)';
  const cohort2Count = 'table tr:eq(2) td:eq(1)';

  visit('/courses/1/sessions/1?sessionLearnergroupDetails=false');

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(cohort1Title)), getText('program0 cohort0'));
    assert.equal(getElementText(find(cohort1Count)), getText('3'));
    assert.equal(getElementText(find(cohort2Title)), getText('program0 cohort1'));
    assert.equal(getElementText(find(cohort2Count)), getText('2'));

  });
});

test('initial state with save works as expected #1773', function(assert) {
  server.create('school', {
    courses: [1]
  });
  server.create('course', {
    school: 1,
    sessions: [1],
    cohorts: [1],
  });
  server.create('sessionType', {
    sessions: [1]
  });
  server.create('program', {
    programYears: [1],
    school: 1
  });
  server.create('programYear', {
    cohort: 1
  });
  server.create('cohort', {
    learnerGroups: [1, 2],
    courses: [1],
    programYear: 1
  });
  server.createList('learnerGroup', 2, {
    cohort: 1
  });
  server.create('ilmSession', {
    session: 1,
  });
  server.create('session', {
    course: 1,
    ilmSession: 1,
  });
  const container = '.detail-learnergroups ';
  const manageButton = container + ' .actions button';
  const lg1 = container + '.available-learner-groups li:eq(0) .clickable';
  const save = container +  '.bigadd';

  visit('/courses/1/sessions/1');
  andThen(function() {
    assert.equal(find(manageButton).length, 1, 'We are not in a collapsed state');
  });
  click(manageButton);
  click(lg1);
  click(save);
  andThen(function() {
    assert.equal(find(manageButton).length, 1, 'We are not in a collapsed state');
  });
});
