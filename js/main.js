'use strict'

var Utils = require('./utils')
var GrammarVerifier = require('./grammar-verifier')
var GrammarParser = require('./grammar-parser')
var FirstSetFinder = require('./first-set-finder')
var FollowSetFinder = require('./follow-set-finder')
var $ = require('jquery')

$('#use-example').click(e => {
  $('#grammar-input').val($('#example').text().trim())
  $('#grammar-form').submit()
  e.preventDefault()
})

$('#grammar-form').submit(e => {
  var grammar, error
  var grammarInput = $('#grammar-input').val().replace(/ε/g, '')

  $('#grammar-input').val(grammarInput)

  reset()

  if (grammarInput.trim() === '') {
    showError('Prencha a gramática')
    e.preventDefault()
    return
  }

  try {
    grammar = GrammarParser.parse(grammarInput)
  } catch (e) {
    error = e.message
  }

  if (error) {
    showError(error)
  } else {
    process(grammar)
  }

  e.preventDefault()
})

$('#sentence-recognizer-form').submit(e => {
  recognize()
  e.preventDefault()
})

function reset() {
  $('#error-message, #result').hide()
}

function showError(message) {
  $('#error-message').hide().html(message).fadeIn('fast')
}

function validate(grammar) {
  if (!GrammarVerifier.isLeftFactored(grammar)) {
    showError('Gramática deve ser fatorada à esquerda')
    return false
  }

  /*if (GrammarVerifier.isLeftRecursive(grammar)) {
    showError('Gramática não pode possuir recursão à esquerda')
    return false
  }*/

  return true
}

function mountTable(object, leftTitle, rightTitle) {
  var table = $('<table class="table table-bordered"></table>')
    .html('\
      <thead>\
        <tr>\
          <th width="10%"></th>\
          <th></th>\
        </tr>\
      </thead>\
      <tbody class="monospace"></tbody>\
    ')

  table.find('th:eq(0)').text(leftTitle)
  table.find('th:eq(1)').text(rightTitle)

  _.forEach(object, (right, left) => {
    var tr = $('<tr></tr>')

    $('<td></td>').appendTo(tr).text(left)
    $('<td></td>').appendTo(tr).text(right.join(', '))

    table.find('tbody').append(tr)
  })

  return table
}

function showGrammarRepresentation(grammar) {
  $('#representation').text(grammar.getRepresentation())
}

function showFirstSetTable(firstSet) {
  var table = mountTable(firstSet, 'Símbolo', 'First')
  $('#first-set-table').html(table)
}

function showFollowSetTable(followSet) {
  followSet = Utils.emptyToEpsilon(followSet)

  var table = mountTable(followSet, 'Símbolo', 'Follow')
  $('#follow-set-table').html(table)
}

 //criar arquivo

function slr(grammar){
  /* Considerando que a gramática inserida já tenha o novo símbolo S'
  (S -> S') não será necessário o código abaixo (corrigir codigo abaixo 
  se for usar)
  grammar.productionSet['@'] = grammar.productionSet[grammar.startSymbol];
  grammar.productionSet[grammar.startSymbol] = ['@']
  */
  
  // Colocar • à esquerda do lado esquerdo de todas as produções
  _.forEach(grammar.productionSet, (production) => {
    _.forEach(production, (right) => {
      right = "•".concat(right)
    })
  })
  
  //1. Inicialização: C = {I0 = closure ({ E’ → • E})}
  var c = {i0: closure(grammar.productionSet[grammar.startSymbol])}

  //2. Repita:Para todo I ∈ C e X ∈ G, calcular goto(I, X) e adicionara C

}

function closure(productionSet){

}


function afterDot(production){
  return x.include(".") ? x.substring(x.indexOf(".")+1) : "";
}

//fim das funções do novo arquivo

function process(grammar) {
  if (!validate(grammar)) {
    return
  }

  try {
    var firstSet = FirstSetFinder.getFirstSets(grammar)
    var followSet = FollowSetFinder.getFollowSets(grammar)

    showGrammarRepresentation(grammar)
    showFirstSetTable(firstSet)
    showFollowSetTable(followSet)
    slr(grammar)

    $('#result').hide().fadeIn('fast')

    $('#sentence-recognizer-table').hide()
    $('#sentence-input').val('')
  } catch (e) {
    console.log(e)
    alert('Ocorreu um erro. Veja o console para mais detalhes.')
  }
}
