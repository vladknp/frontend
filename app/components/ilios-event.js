import Ember from 'ember';

const { Component, computed, inject, RSVP, isEmpty} = Ember;
const { notEmpty } = computed;
const { service } = inject;
const { Promise, map } = RSVP;

export default Component.extend({
  store: service(),
  i18n: service(),
  event: null,
  classNames: ['ilios-event'],
  description: computed('session.description.description', function(){
    return new Promise(resolve => {
      this.get('session').then(session=>{
        session.get('sessionDescription').then(description=>{
          if(isEmpty(description)){
            resolve(null);
          } else {
            resolve(description.get('description'));
          }
        });
      });
    });
  }),
  isOffering: notEmpty('event.offering'),
  taughtBy: computed('i18n.locale', 'event.instructors', function(){
    const instructors = this.get('event.instructors');
    if (isEmpty(instructors)) {
      return '';
    } else {
      return this.get('i18n').t('general.taughtBy', {instructors});
    }
  }),
  sessionIs: computed('session.sessionType', 'i18n.locale', function(){
    return new Promise(resolve => {
      const i18n = this.get('i18n');
      this.get('session').then(session => {
        session.get('sessionType').then(sessionType => {
          resolve(i18n.t('general.sessionIs', {type: sessionType.get('title')}));
        });
      });
    });
  }),
  offering: computed('event.offering', function(){
    const offeringId = this.get('event.offering');
    const store = this.get('store');
    return new Promise(resolve => {
      if(!offeringId){
        resolve(null);
      } else {
        store.findRecord('offering', offeringId).then(offering => {
          resolve(offering);
        });
      }
    });
  }),
  ilmSession: computed('event.ilmSession', function(){
    const ilmSessionId = this.get('event.ilmSession');
    const store = this.get('store');
    return new Promise(resolve => {
      if(!ilmSessionId){
        resolve(null);
      } else {
        store.findRecord('ilm-session', ilmSessionId).then(ilmSession => {
          resolve(ilmSession);
        });
      }
    });
  }),
  courseObjectives: computed('i18n.locale', 'course.objectives.[]', function(){
    const i18n = this.get('i18n');
    return new Promise(resolve => {
      this.get('course').then(course => {
        course.get('objectives').then(objectives => {
          map(objectives.toArray(), objective => {
            return new Promise(resolve => {
              objective.get('topParents').then(parents => {
                let parent = parents.get('firstObject');
                parent.get('competency').then(competency => {
                  //strip all HTML
                  let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
                  if(isEmpty(competency)){
                    resolve({
                      title,
                      domain: i18n.t('general.noAssociatedCompetencies')
                    });
                  } else {
                    competency.get('domain').then(domain => {
                      resolve({
                        title,
                        domain: competency.get('title') + ' (' + domain.get('title') + ')'
                      });
                    });
                  }
                });
              });
            });
          }).then(mappedObjectives => {
            resolve(mappedObjectives);
          });
        });
      });
    });
  }),
  courseLearningMaterials: computed('i18n.locale', 'course', function() {
    return new Promise(resolve => {
      const store = this.get('store');
      this.get('course').then(course => {
        store.query('courseLearningMaterial', {
          filters: {
            course: course.get('id')
          },
          limit: 1000
        }).then((courseLearningMaterials) => {
          map(courseLearningMaterials.toArray(), clm => {
            return new Promise(resolve => {
              clm.get('learningMaterial').then(learningMaterial => {
                const { required, storedNotes, publicNotes } = clm.getProperties('required', 'notes', 'publicNotes');
                const notes = publicNotes?storedNotes:'';
                const {title, description, url, type, mimetype, filesize, citation} = learningMaterial.getProperties([
                  'title', 'description', 'url', 'type', 'mimetype', 'filesize', 'citation'
                ]);

                let obj = {
                  title,
                  description,
                  required,
                  notes,
                  url,
                  type,
                  mimetype,
                  filesize,
                  citation,
                };

                resolve(obj);
              });
            });
          }).then(mappedLearningMaterials => {
            resolve(mappedLearningMaterials);
          });
        });
      });
    });
  }),
  sessionObjectives: computed('i18n.locale', 'session.objectives.[]', function(){
    return new Promise(resolve => {
      this.get('session').then(session => {
        session.get('objectives').then(objectives => {
          map(objectives.toArray(), objective => {
            return new Promise(resolve => {
              objective.get('topParents').then(parents => {
                let parent = parents.get('firstObject');
                parent.get('competency').then(competency => {
                  //strip all HTML
                  let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
                  if(isEmpty(competency)){
                    resolve({
                      title,
                      domain: this.get('i18n').t('general.noAssociatedCompetencies')
                    });
                  } else {
                    competency.get('domain').then(domain => {
                      resolve({
                        title,
                        domain: competency.get('title') + ' (' + domain.get('title') + ')'
                      });
                    });
                  }
                });
              });
            });
          }).then(mappedObjectives => {
            resolve(mappedObjectives);
          });
        });
      });
    });
  }),

  sessionLearningMaterials: computed('i18n.locale', 'session', function() {
    return new Promise(resolve => {
      this.get('session').then(session => {
        this.get('store').query('sessionLearningMaterial', {
          filters: {
            session: session.get('id')
          },
          limit: 1000
        }).then((sessionLearningMaterials) => {
          map(sessionLearningMaterials.toArray(), slm => {
            return new Promise(resolve => {
              slm.get('learningMaterial').then(learningMaterial => {
                const { required, storedNotes, publicNotes } = slm.getProperties('required', 'notes', 'publicNotes');
                const notes = publicNotes?storedNotes:'';
                const {title, description, url, type, mimetype, filesize, citation} = learningMaterial.getProperties([
                  'title', 'description', 'url', 'type', 'mimetype', 'filesize', 'citation'
                ]);

                let obj = {
                  title,
                  description,
                  required,
                  notes,
                  url,
                  type,
                  mimetype,
                  filesize,
                  citation,
                };

                resolve(obj);
              });
            });
          }).then(lmObjects => {
            resolve(lmObjects);
          });
        });
      });
    });
  }),
  course: computed('session.course', function(){
    return new Promise(resolve => {
      this.get('session').then(session=>{
        session.get('course').then(course=>{
          resolve(course);
        });
      });
    });
  }),
  sessionTitle: computed('session.title', 'isOffering', function(){
    return new Promise(resolve => {
      let prefix = this.get('isOffering')?'':'ILM: ';
      this.get('session').then(session => {
        resolve(prefix + session.get('title'));
      });
    });
  }),
  session: computed('offering.session', 'ilmSession.session', function(){
    const relationship = this.get('isOffering')?'offering':'ilmSession';
    return new Promise(resolve => {
      this.get(relationship).then(related => {
        related.get('session').then(session=>{
          resolve(session);
        });
      });
    });
  }),
});
