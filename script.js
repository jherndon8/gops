const funcText = document.getElementById('func');

const defaultFunc = '// default\n(bidsMade, bidsLeft, treasure, curTie) => {\n return treasure;\n}'
const strats = [eval(defaultFunc)]
const stratNames = ['default']
const player1 = document.getElementById('player1')
const player2 = document.getElementById('player2')
const player3 = document.getElementById('player3')

function resetFunc() {
    funcText.value = defaultFunc;
}

function evalFunc() {
    console.log(funcText.value)
    const strat = eval(funcText.value)
    strats.push(strat)
    let name = funcText.value.split('\n')[0].split(' ')[1]
    if (name == 'default') {
        name = "Strategy " + stratNames.length;
    }
    stratNames.push(name)
    updateOptions()
    resetFunc();
}

function simulate() {
    const st1 = Number(player1.value)
    const st2 = Number(player2.value) 
    console.log(playNGames(st1, st2, 10))

}

function updateOptions() {
   player1.innerHTML = ['Random', ...stratNames].map((n, index) => '<option value="'
   + (index - 1) + '">' + n + '</option>')
   player2.innerHTML = player1.innerHTML
   player3.innerHTML = player1.innerHTML
}

resetFunc();
updateOptions();

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function playGame(strat1, strat2) {
    const bidsMade1 = []
    const bidsMade2 = []
    const bidsLeft1 = [...Array(13).keys()].map(i=>i+1)
    const bidsLeft2 = [...bidsLeft1]
    deck = [...bidsLeft1]
    shuffleArray(deck)
    var tied = 0
    var total1 = 0
    var total2 = 0
    while (deck.length > 0) {
        const treasure = deck.pop()
        const bid1 = strat1(bidsMade1, bidsLeft1, treasure, tied)
        const bid2 = strat2(bidsMade2, bidsLeft2, treasure, tied)
        bidsMade1.push([bid2, treasure])
        bidsMade2.push([bid1, treasure])
        if (!bidsLeft1.find(bid => bid === bid1)) {
            throw Error('strat 1 cheated, bid ' + bid1 + ' with hand ' + bidsLeft1)
        }
        if (!bidsLeft2.find(bid => bid === bid2)) {
            throw Error('strat 2 cheated, bid ' + bid2 + ' with hand ' + bidsLeft2)
        }
        bidsLeft1.splice(bidsLeft1.indexOf(bid1), 1)
        bidsLeft2.splice(bidsLeft2.indexOf(bid2), 1)
        if (bid1 > bid2) {
            total1 += treasure + tied;
        }
        if (bid1 < bid2) {
            total2 += treasure + tied;
        }
        if (bid1 === bid2) {
            tied += treasure
        } else {
            tied = 0;
        }
    }
    let result = total1 > total2 ? '1' : total2 > total1 ? '2' : '0'
    return {result,
        bidsMade2: bidsMade1.map(a=>a[0]),
        bidsMade1: bidsMade2.map(a=>a[0]),
        treasureOrder: bidsMade1.map(a=>a[1]),
        total1, total2,
        fullResult: result + ": " + total1 + '-' + total2}
}

function playNGames(st1, st2, n) {
    console.log(st1, st2);
    const getStrat1 = () => strats[st1 < 0 ? Math.floor(Math.random() * strats.length):st1];
    const getStrat2 = () => strats[st2 < 0 ? Math.floor(Math.random() * strats.length):st2];
    return playNGamesHelper(getStrat1, getStrat2, n);
}

function playNGamesHelper(getStrat1, getStrat2, n) {
    const results = []
    for (var i = 0; i < n; i++) {
        results.push(playGame(getStrat1(), getStrat2()));
    }
    const p1Wins = results.filter(r => r.result == '1').length
    const p2Wins = results.filter(r => r.result == '2').length
    const metaResult = p1Wins > p2Wins ? '1' : p1Wins < p2Wins ? '2' : '0'
    const ties = n - p1Wins - p2Wins;
    return {allResults: results, p1Wins, p2Wins, metaResult, summary: metaResult + ": " + p1Wins + "-" + p2Wins}
}
