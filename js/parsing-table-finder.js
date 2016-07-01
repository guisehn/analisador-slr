'use strict'

var _ = require('lodash')

function generateTable(grammar) {
  // Colocar • à esquerda do lado esquerdo de todas as produções
  _.forEach(grammar.productionSet, (production) => {
    _.forEach(production, (right) => {
      right = '•'.concat(right)
    })
  })

  // 1. Inicialização: C = {I0 = closure ({ E’ → • E})}
  var c = { i0: closure(grammar.productionSet[grammar.startSymbol]) }

  // 2. Repita:Para todo I ∈ C e X ∈ G, calcular goto(I, X) e adicionara C

  // Dudu: aqui você deve retornar a tabela que usamos para reconhecimento,
  // ela é dividida em duas tabelas:
  //
  // actions: a parte das ações, onde as colunas são os não-terminais
  // e os valores podem ser "sX", "rX" ou "accept", onde X é o número
  //
  // goto: a parte dos desvios, onde as colunas são os terminais e os
  // valores podem ser os números dos desvios
  //
  // Exemplos destes valores estão no arquivo fixtures-applier.js
  return {
    actions: null,
    goto: null
  }
}

function closure(productionSet) {

}

function afterDot(production) {
  return x.include('.') ? x.substring(x.indexOf('.') + 1) : ''
}

module.exports = {
  generateTable: generateTable
}
