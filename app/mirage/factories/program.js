/*
  This is an example factory definition. Factories are
  used inside acceptance tests.

  Create more files in this directory to define additional factories.
*/
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `program ${i}`,
  shortTitle: (i) => `short_${i}`,
  owningSchool: (i) => (i+1),
  duration: 4,
  deleted: false,
  publishedAsTbd: false,
});