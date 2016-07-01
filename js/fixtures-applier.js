let separateProductions = [
  { left: '@', right: 'E' },
  { left: 'E', right: 'E+T' },
  { left: 'E', right: 'T' },
  { left: 'T', right: 'T*F' },
  { left: 'T', right: 'F' },
  { left: 'F', right: '(E)' },
  { left: 'F', right: 'i' }
]

let actionTable = {
  0: {
    'i': 's5',
    '(': 's4'
  },

  1: {
    '+': 's6',
    '$': 'accept'
  },

  2: {
    '+': 'r2',
    '*': 's7',
    ')': 'r2',
    '$': 'r2'
  },

  3: {
    '+': 'r4',
    '*': 'r4',
    ')': 'r4',
    '$': 'r4'
  },

  4: {
    'i': 's5',
    '(': 's4'
  },

  5: {
    '+': 'r6',
    '*': 'r6',
    ')': 'r6',
    '$': 'r6'
  },

  6: {
    'i': 's5',
    '(': 's4'
  },

  7: {
    'i': 's5',
    '(': 's4'
  },

  8: {
    '+': 's6',
    ')': 's11'
  },

  9: {
    '+': 'r1',
    '*': 's7',
    ')': 'r1',
    '$': 'r1'
  },

  10: {
    '+': 'r3',
    '*': 'r3',
    ')': 'r3',
    '$': 'r3'
  },

  11: {
    '+': 'r5',
    '*': 'r5',
    ')': 'r5',
    '$': 'r5'
  },
}

let gotoTable = {
  0: {
    'E': 1,
    'T': 2,
    'F': 3
  },

  4: {
    'E': 8,
    'T': 2,
    'F': 3
  },

  6: {
    'T': 9,
    'F': 3
  },

  7: {
    'F': 10
  }
}

module.exports = {
  apply: function(grammarParser, parsingTableFinder) {
    grammarParser.getSeparateProductions = () => separateProductions
    parsingTableFinder.generateTable = () => ({ actions: actionTable, goto: gotoTable })
  }
}
