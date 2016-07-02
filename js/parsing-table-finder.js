'use strict'

var _ = require('lodash')

function generateTable(grammar) {
  

  // Coloca o ponto no incio do lado direito de cada produção
  for(var i in grammar){
    grammar[i]['right'] = moveDot(grammar[i]['right'])
  }

  // A. Construa o conjunto canico C = {I0, I1, ..., In}
  goto('a', 'a')
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

  // B. Cada linha da tabela corresponde a um estado i do analisador, o qual é
  //    construído a partir de Ii, o <= i <= n

  // C. A linha da tabela ação para o estado i é determinada pelas regras abaixo.
  //    Entretando, se houver algum conflito na aplicação destas regras, esntão a
  //    gramática não é SLR(1), e o algoritmo falha:

  // 1. Se A → α•aβ está em Ii e goto(Ii,a) = Ij, a ∈ Vt, então ação[i, a] = 
  //    empilhar j
  // 2. Se A → α• está em Ii, A ≠ S', então ação[i, a] = reduzir A → α, para todo
  //    a ∈ Seguinte(A)
  // 3. Se S' → S• está em Ii, então defina ação[i, $] = aceita

  // D. A linha da tabela desvio para o estado i é determinado do seguinte modo:

  // 1. Para todos os não terminais A, se goto(Ii, A) = Ij, então descio[i, A] = j

  // E. As entradas não definidas são erros

  // F. O estado de partida é o estado 0




  return {
    actions: null,
    goto: null
  }
}

function closure(productionSet) {

}

function goto(state, symbol){
  //Retorna as produções de state com o • movido que tenha o symbol no lado direito do •
  var ret = []
  // Para cada produção do state
  for(var i in state){
    // Se o simbolo do lado direito do • é igual à symbol
    if(afterDot(state[i]['right']) === symbol)
      // A produção é colocada na lista de retorno com o • movido à direita
      ret.push({'left':state[i]['left'],'right':moveDot(state[i]['right'])})
  }
  return ret;
}

function afterDot(production) {
  return production.includes('•') ? production.substring(production.indexOf('•') + 1) : ''
}

function moveDot(rightProduction){
  var aux = rightProduction.indexOf('•')
  rightProduction = rightProduction.replace('•', '')
  rightProduction = rightProduction.slice(0, aux+1) + '•' + rightProduction.slice(aux+1);
  return rightProduction
}

module.exports = {
  generateTable: generateTable
}
