'use strict'

var Utils = require('./utils')
var GrammarVerifier = require('./grammar-verifier')
var GrammarParser = require('./grammar-parser')
var FirstSetFinder = require('./first-set-finder')
var FollowSetFinder = require('./follow-set-finder')
var ParsingTableFinder = require('./parsing-table-finder')
var SentenceRecognizer = require('./sentence-recognizer')
var $ = require('jquery')

var appState = {}

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

function showSeparateProductions(separateProductions) {
  $('#separate-productions').html(separateProductions
    .map(p => $('<li></li>').html(p.left + ' → ' + p.right)))
}

function showParsingTable(grammar, parsingTable) {
  var table = $('<table class="table table-bordered"></table>')
    .html('\
      <thead class="center">\
        <tr>\
          <th width="10%" rowspan="2">Estado</th>\
          <th rowspan="1">Ação</th>\
          <th>Desvio</th>\
        </tr>\
      </thead>\
      <tbody></tbody>\
    ')

  var nonTerminals = grammar.getNonTerminals().filter(s => s !== '@')
  var terminals = grammar.getTerminals().concat('$')
  var nonTerminalsHeaders = nonTerminals.map(nt => $('<th></th>').text(nt))
  var terminalsHeaders = terminals.map(t => $('<th></th>').text(t))
  var amountOfStates = _.max([_.keys(parsingTable.actions).length, _.keys(parsingTable.gotoTable).length])

  table.find('th:eq(1)').attr('colspan', terminals.length)
  table.find('th:eq(2)').attr('colspan', nonTerminals.length)

  $('<tr class="monospace center"></tr>')
    .appendTo(table.find('thead'))
    .append(terminalsHeaders.concat(nonTerminalsHeaders))

  table.find('tbody').append(_.times(amountOfStates, n => $('<tr class="center"><td>' + n + '</td></tr>')))

  _.times(amountOfStates, stateNumber => {
    var tr = table.find('tbody tr').eq(stateNumber)
    var actions = parsingTable.actions[stateNumber] || {};
    var deviations = parsingTable.goto[stateNumber] || {};

    terminals.forEach(terminal => {
      var action = actions[terminal]
      var accepted = (action === 'accept')
      var text = accepted ? 'ac' : (action || '')

      $('<td></td>').text(text).appendTo(tr).addClass(accepted ? 'success' : '')
    })

    nonTerminals.forEach(terminal => {
      var text = deviations[terminal] || ''
      $('<td></td>').text(text).appendTo(tr)
    })
  })

  var el = table.find('tbody tr:first td:gt(1)')
  el.css('width', (90 / el.length) + '%')

  $('#parsing-table').html(table)
}

function showSentenceRecognition(recognition) {
  var table = $('<table class="table table-bordered"></table>')
    .html('\
      <thead>\
        <tr>\
          <th>Pilha</th>\
          <th>Entrada</th>\
          <th>Ação</th>\
        </tr>\
      </thead>\
      <tbody></tbody>\
    ')

  _.forEach(recognition.steps, step => {
    var tr = $('<tr></tr>')
    var actionText

    switch (step.action[0]) {
      case 'S':
        actionText = 'Empilha'
        break

      case 'R':
        actionText = 'Reduz'
        break

      case 'E':
        actionText = 'Erro'
        break

      case 'A':
        actionText = 'Aceita'
        break
    }

    $('<td class="monospace"></td>').appendTo(tr).text(step.stack.join(' '))
    $('<td class="monospace"></td>').appendTo(tr).text(step.input)
    $('<td></td>').appendTo(tr).html(actionText + (step.action[1]
      ? ' <span class="monospace">' + step.action[1] + '</span>' : ''))

    table.find('tbody').append(tr)
  })

  var message = $('<div role="alert" class="alert"></div>')
    .addClass(recognition.success ? 'alert-success' : 'alert-danger')
    .text(recognition.success ? 'A sentença foi reconhecida' : 'A sentença não foi reconhecida')

  $('#sentence-recognizer-table').hide().html('').append(message).append(table).fadeIn('fast')
}

function process(grammar) {
  if (!validate(grammar)) {
    return
  }

  try {
    var g = appState

    g.grammar = grammar
    g.firstSet = FirstSetFinder.getFirstSets(grammar)
    g.followSet = FollowSetFinder.getFollowSets(grammar)
    g.separateProductions = GrammarParser.getSeparateProductions(grammar)
    g.parsingTable = ParsingTableFinder.generateTable(g.separateProductions, g.followSet)

    showGrammarRepresentation(g.grammar)
    showFirstSetTable(g.firstSet)
    showFollowSetTable(g.followSet)
    showSeparateProductions(g.separateProductions)
    showParsingTable(grammar, g.parsingTable)

    $('#result').hide().fadeIn('fast')

    $('#sentence-recognizer-table').hide()
    $('#sentence-input').val('')
  } catch (e) {
    console.log(e)
    alert('Ocorreu um erro. Veja o console para mais detalhes.')
  }
}

function recognize() {
  var input = $('#sentence-input').val()

  try {
    var recognition = SentenceRecognizer.recognize(input, appState.separateProductions
      , appState.parsingTable.actions, appState.parsingTable.goto)

    showSentenceRecognition(recognition)
  } catch (e) {
    console.log(e)
    alert('Ocorreu um erro. Veja o console para mais detalhes.')
  }
}
