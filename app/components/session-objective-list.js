import Ember from 'ember';

export default Ember.Component.extend({
  session: null,
  classNames: ['session-objective-list'],
  objectives: Ember.computed.alias('session.objectives'),
  sortBy: ['id'],
  sortedObjectives: Ember.computed.sort('objectives', 'sortBy'),
  actions: {
    manageParents: function(objective){
      this.sendAction('manageParents', objective);
    },
    manageDescriptors: function(objective){
      this.sendAction('manageDescriptors', objective);
    }
  }
});
