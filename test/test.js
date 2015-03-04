var should = require('chai').should(),
    expect = require('chai').expect,
    similarity = require('../similarity');




describe('#basic result', function() {
  var index = similarity(),
      items = [
        {id: 1, name: 'Item 1', rating: 0, tags: ['tag1', 'tag2', 'tag3']},
        {id: 2, name: 'Item 2', rating: 0, tags: ['tag1', 'tag2', 'tag3']},
        {id: 3, name: 'Item 3', rating: 5, tags: []},
        {id: 4, name: 'Item 4', rating: 0, tags: ['tag1', 'tag2']},
      ],
      result = undefined;
  
  index.field('rating');
  index.field('tags');
  
  items.forEach(function(item) {
    index.add(item);
  });
  
  result = index.similarTo(1);

  
  
  it('verifies result is an array', function() {
    expect(result).to.be.a('array');
  });

  it('verifies result has a length of 2', function() {
    expect(result).to.have.length(2);
  });

  it('verifies Item 1 is related to Item 2 with a score of 1.000000000', function() {
    expect(result[0].score).to.equal(parseFloat(1).toFixed(9));
  });

  it('verifies Item 4 is related to Item 1 with a score of 0.816496581', function() {
    expect(result[1].score).to.equal(parseFloat(0.816496581).toFixed(9));
  });
});


