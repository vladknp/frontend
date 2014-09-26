import Ember from 'ember';

export default Ember.Controller.extend({
  title: null,
  competency: null,
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  competencies: function(){
    return this.get('programYear.competencies');
  }.property('programYear.competencies.[]'),
  actions: {
    save: function() {
      var objective = this.store.createRecord('objective', {
        title: this.get('title'),
        programYear: this.get('programYear.model'),
        competency: this.get('competency'),
      });
      this.get('programYear').get('objectives').addObject(objective);
      this.set('title', null);
      this.set('programYear.isDirty', true);
      this.transitionToRoute(
        'programyearobjectives.new',
        this.get('programYear.program'),
        this.get('programYear.model')
      );
    }
  }
});
