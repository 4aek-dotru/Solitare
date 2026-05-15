import Game from './game.mjs';
const mainContainer = document.getElementById('main-container');
const rulesContainer = document.getElementById('rules-container');
const gameContainer = document.getElementById('game-container');
const endGameContainer = document.getElementById('end-game-container');
let _game;

document.getElementById('rules-button').addEventListener('click', () => {
    mainContainer.style.display = 'none';
    rulesContainer.style.display = 'flex';
    document.getElementById('main-menu-button').style.display = 'flex';
})
document.getElementById('main-menu-button').addEventListener('click', () => {
    mainContainer.style.display = 'flex';
    rulesContainer.style.display = 'none';
    document.getElementById('main-menu-button').style.display = 'none';
})
document.getElementById('start-game-button').addEventListener('click', () => {
    mainContainer.style.display = 'none';
    gameContainer.style.display = 'flex';
    document.getElementById('main-menu-from-game-button').style.display = 'flex';
    _game = new Game();
})
document.getElementById('main-menu-from-game-button').addEventListener('click', e => {
    mainContainer.style.display = 'flex';
    gameContainer.style.display = 'none';
    document.getElementById('main-menu-from-game-button').style.display = 'none';
    if(_game) _game = null;
})
document.getElementById('new-game-button').addEventListener('click', () => {
    endGameContainer.style.display = 'none';
    if(_game) _game = null;
    _game = new Game();
})
document.getElementById('back-to-main-menu').addEventListener('click', () => {
    endGameContainer.style.display = 'none';
    mainContainer.style.display = 'flex';
    gameContainer.style.display = 'none';
    if(_game) _game = null;
})