'use strict'

var _ = require('lodash')
var Utils = require('./utils')

function generateTable(grammar, followSet) {
  
  // Coloca o ponto no incio do lado direito de cada produção
  for(var i in grammar){
    grammar[i]['right'] = moveDot(grammar[i]['right'])
  }

  // A. Construa o conjunto canico C = {I0, I1, ..., In}

  var n = 0
  // 1. Inicialização: C = {I0 = closure ({ E’ → • E})}
  var c = {}
  c['I'+(n++)] = closure(grammar, [grammar[0]], 0)

  // 2. Repita:Para todo I ∈ C e X ∈ G, calcular goto(I, X) e adicionara C

  // Enquanto tiver estados para serem lidos
  var countState = 0;
  while(true){

      var productionSetLastI = containsSymbolsAfterDot(c['I'+countState])

      for(var i in productionSetLastI){
        
        var x = productionSetLastI[i]

        //Armazenar o goto

        var productionSet = goto(c['I'+countState],x)

        productionSet = closure(grammar, productionSet, 0)
        var a = cotainsStateResult(c, productionSet)
        if(!a['symbol']){
          c['I'+(n++)] = productionSet
        }
      }

      countState++;
      if(countState==Object.keys(c).length) break;
  }

  // B. Cada linha da tabela corresponde a um estado i do analisador, o qual é
  //    construído a partir de Ii, o <= i <= n
  
  var actionsTable = {}
  var gotoTable = {}

  // C. A linha da tabela ação para o estado i é determinada pelas regras abaixo.
  //    Entretando, se houver algum conflito na aplicação destas regras, esntão a
  //    gramática não é SLR(1), e o algoritmo falha:

  for(var n in c){ // Para cada estado n de c
    var stateN = n.replace('I', '')
    actionsTable[stateN] = {}
    gotoTable[stateN] = {}
    for(var i in c[n]){ // Para cada produção de In

      var production = c[n][i]
      var x = afterDot(production['right'])
      if(x){
        // 1. Se A → α•aβ está em Ii e goto(Ii,a) = Ij, a ∈ Vt, então ação[i, a] = empilhar j
        var resultGoto = goto(c[n], x)
        var resultClosure = closure(grammar, resultGoto, 0)
        var resultStateResult = cotainsStateResult(c, resultClosure) 
        var stateJ = resultStateResult['i'].replace('I', '')
        if(Utils.isTerminal(x)){
          var aux = {}
          actionsTable[stateN][x] = 's'+stateJ
        }else{
          gotoTable[stateN][x] = ''+stateJ
        }
      }else{
        
        if(production['left'] !== '@'){
          // 2. Se A → α• está em Ii, A ≠ S', então ação[i, a] = reduzir A → α, para todo  a ∈ Follow(A)
          //Follow
          var terminals = followSet[production['left']]
          for(var t in terminals){
            actionsTable[stateN][terminals[t]] = 'r'+indexProduction(grammar, production)
          }
        }else{
          // 3. Se S' → S• está em Ii, então defina ação[i, $] = aceita
          actionsTable[stateN]['$'] = 'accept'
        }
      }
      
    }
  }
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
    actions: actionsTable,
    goto: gotoTable
  }
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
  return ret
}


function closure(grammar, productionSet, index) {
  
  //Para cada produção do productionSet
  for(var i = index; i < productionSet.length; i++){
    //Se o símbolo do lado direito do • for um não terminal
    var rightDotSymbol = afterDot(productionSet[i]['right'])
    if(Utils.isNonTerminal(rightDotSymbol)){

      var aux = productionSet.length
      var profuctionFound = getProduction(grammar, rightDotSymbol)
      //Faz a união entre as produções e as encontradas
      productionSet = _.union(productionSet, profuctionFound)

      //Faz Closure de cada produção encontrada e uni o resultado ao retorno
      _.union(productionSet, closure(grammar, productionSet, aux))

    }
  }
  return productionSet
}

// Retorna o símbolo do lado direito do •
function afterDot(production) {
  return production.includes('•') ? production.substring(production.indexOf('•') + 1, production.indexOf('•') + 2) : ''
}

// Move o ponto para direita
function moveDot(rightProduction){
  var aux = rightProduction.indexOf('•')
  rightProduction = rightProduction.replace('•', '')
  rightProduction = rightProduction.slice(0, aux+1) + '•' + rightProduction.slice(aux+1)
  return rightProduction
}

// Retorna as porduçãos de uma gramática que lefSymbol do lado esquerdo
function getProduction(grammar, leftSymbol){
  var ret = []
  for(var i in grammar){
    if(grammar[i]['left'] === leftSymbol){
      ret.push(grammar[i])
    }
  }
  return ret
}

//Retorna os símbolos do lado direito do •
function containsSymbolsAfterDot(productionSet){
  var ret = []
  for(var i in productionSet){
    var symbolAfterDot = afterDot(productionSet[i]['right'])
    if(symbolAfterDot && !ret.includes(symbolAfterDot)){
      ret.push(symbolAfterDot)
    }
  }
  return ret
}

//Retorna o estado que contem o mesmo resultado deste closure
function cotainsStateResult(c, productionSet){
  for(var i in c){
    if(_.isEqual(c[i], productionSet)){
    //if(c[i] == productionSet){
      return {'symbol':c[i],'i':i}
    }
  }
  return {'symbol':null,'i':null}
}

//Retorna o índice da produção na gramática
function indexProduction(grammar, production){

  for(var i = 0; i < grammar.length; i++){
    var a = {}
    var b = {}
    a['left'] = grammar[i]['left']
    b['left'] = production['left']
    a['right'] = grammar[i]['right'].replace('•','')
    b['right'] = production['right'].replace('•','')
    if(_.isEqual(a,b)){
      return i
    }
  }
  return -1
}

module.exports = {
  generateTable: generateTable
}
