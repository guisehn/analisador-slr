'use strict'

const _ = require('lodash')

function recognize(input, productionSet, actionTable, gotoTable) {
  input += '$'

  let steps = []
  let stack = [0]
  let success = false

  while (true) {
    let startOfInput = input[0]
    let topOfStack = _.last(stack)
    let actionCell = _.get(actionTable[topOfStack], startOfInput)
    let currentStep = { stack: _.clone(stack), input: input, action: '' }

    if (!actionCell) {
      currentStep.action = ['E']
      steps.push(currentStep)
      break
    }

    if (actionCell === 'accept') {
      currentStep.action = ['A']
      success = true
      steps.push(currentStep)
      break
    }

    let action = actionCell[0]
    let n = parseInt(actionCell.substr(1), 10)

    if (action === 's') {
      currentStep.action = ['S']
      stack.push(startOfInput, n)
      input = input.substr(1)

      steps.push(currentStep)
      continue
    }

    if (action === 'r') {
      let production = productionSet[n - 1]
      currentStep.action = ['R', production.left + ' → ' + production.right]

      // removes right-side of the production from the stack
      _.times(production.right.length * 2, n => stack.pop())

      // adds left-side of the production + go-to deviation to the stack
      let topOfStack = _.last(stack)
      let deviation = _.get(gotoTable[topOfStack], production.left)

      if (!deviation) {
        currentStep.action = 'Erro'
        steps.push(currentStep)
        break
      }

      stack.push(production.left, deviation)
      steps.push(currentStep)
      continue
    }
  }

  return { success: success, steps: steps }
}

module.exports = {
  recognize: recognize
}
