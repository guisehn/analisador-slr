var Utils = require('./utils')
var _ = require('lodash')

function getFirst(grammar, symbol, history) {
  if (Utils.isTerminal(symbol)) {
    return [symbol]
  }

  history = history ? history.concat(symbol) : []

  var firsts = (grammar[symbol] || []).map(e => {
    var firsts = []

    // condição especial pra sentença vazia
    if (e === '') {
      return ['']
    }

    for (var i = 0; i < e.length; i++) {
      var s = e[i]

      // impede recursão infinita
      if (_.includes(history, s)) {
        break
      }

      var first = getFirst(grammar, s, history)
      firsts.push(_.filter(first, s => s !== ''))

      // testa próximo símbolo apenas se conjunto first
      // possui sentença vazia
      if (!_.includes(first, '')) {
        break
      }
    }

    return _.flatten(firsts)
  })

  return _(firsts).flatten().uniq().value()
}

function getFirsts(grammar) {
  return _.mapValues(grammar, (rightSide, leftSide) => getFirst(grammar, leftSide))
}

module.exports = {
  getFirsts: getFirsts
}
