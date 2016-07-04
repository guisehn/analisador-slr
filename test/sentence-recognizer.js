'use strict'

var _ = require('lodash')
var expect = require('chai').expect
var SentenceRecognizer = require('../js/sentence-recognizer')

describe('SentenceRecognizer', () => {

  let productionSet = [
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

  describe('#recognize()', () => {
    it('should recognize sentence i*i+i correctly', () => {
      let result = SentenceRecognizer.recognize('i*i+i', productionSet, actionTable, gotoTable)
      //console.log(JSON.stringify(result, null, 4))

      expect(result.success).to.be.true
      expect(result.steps).to.be.deep.equal([
        { stack: [0], input: 'i*i+i$', action: ['S'] },
        { stack: [0, 'i', 5], input: '*i+i$', action: ['R', 'F', 'i'] },
        { stack: [0, 'F', 3], input: '*i+i$', action: ['R', 'T', 'F'] },
        { stack: [0, 'T', 2], input: '*i+i$', action: ['S'] },
        { stack: [0, 'T', 2, '*', 7], input: 'i+i$', action: ['S'] },
        { stack: [0, 'T', 2, '*', 7, 'i', 5], input: '+i$', action: ['R', 'F', 'i'] },
        { stack: [0, 'T', 2, '*', 7, 'F', 10], input: '+i$', action: ['R', 'T', 'T*F'] },
        { stack: [0, 'T', 2], input: '+i$', action: ['R', 'E', 'T'] },
        { stack: [0, 'E', 1], input: '+i$', action: ['S'] },
        { stack: [0, 'E', 1, '+', 6], input: 'i$', action: ['S'] },
        { stack: [0, 'E', 1, '+', 6, 'i', 5], input: '$', action: ['R', 'F', 'i'] },
        { stack: [0, 'E', 1, '+', 6, 'F', 3], input: '$', action: ['R', 'T', 'F'] },
        { stack: [0, 'E', 1, '+', 6, 'T', 9], input: '$', action: ['R', 'E', 'E+T'] },
        { stack: [0, 'E', 1], input: '$', action: ['A'] }
      ])
    })
  })

})
