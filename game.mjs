const closeCardsContainer = document.getElementById('close-cards');
const openCardsContainer = document.getElementById('open-cards');
const cardSlotsContainer = document.querySelectorAll('.card-slot');
const gameCellsContainer = document.querySelectorAll('.game-cell');
const suits = [
    { name: "clubs", group: "BLACK" },
    { name: "spades", group: "BLACK" },
    { name: "hearts", group: "RED" },
    { name: "diamonds", group: "RED" }
];
const ranks = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

export default class Game {
    CARDS_SETTINGS = {};
    ALL_CARDS = [];
    CURRENT_CLONES = [];
    DRAGGED_CARDS;
    CURRENT_CARD;
    CURRENT_CONTAINER;
    CURRENT_CORDS_CARD;
    CURRENT_CORDS_MOUSE;
    isAnimating;
    constructor() {
        this.clearGame();
        this.createCards();
        closeCardsContainer.addEventListener('click', this.returnCards.bind(this))
        this.isAnimating = false;
    }

    clearGame() {
        document.getElementById('close-cards').innerHTML = '';
        document.getElementById('open-cards').innerHTML = '';
        document.querySelectorAll('.card-slot').forEach(slot => {
            slot.innerHTML = '';
        });
        document.querySelectorAll('.game-cell').forEach(cell => {
            cell.innerHTML = '';
        });
    }

    createCards() {
        for(let i = 0; i < 52; i++) {
            const rowCard = document.createElement('div');
            rowCard.style.zIndex = i + 1;
            rowCard.classList.add('card');
            rowCard.classList.add('close');
            rowCard.dataset.id = i;
            closeCardsContainer.appendChild(rowCard);
            rowCard.ondragstart = function() {
                return false;
            };
            this.ALL_CARDS.push(rowCard);
            this.mouseDownHandler = (e) => this.mouseDown(rowCard, e);
            rowCard.addEventListener('mousedown', this.mouseDownHandler);
        }
        this.randomCardsSettings();
        this.shuffleCards();
    }
    mouseDown(card, e) {
        if (this.isAnimating) return;
        this.CURRENT_CORDS_MOUSE = e;
        this.CURRENT_CONTAINER = card.parentNode;
        this.startDrag(card);
    }
    moveToOpenContainer(parent) {
        if (this.isAnimating) return;
        
        const childs = parent.childNodes;
        if (childs.length === 0) {
            console.log('Нет карт в колоде');
            return;
        }

        const card = childs[childs.length - 1];

        if (!card.classList?.contains('card')) return;

        openCardsContainer.appendChild(card);
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';

        this.openCard(card);
        this.checkColumn(openCardsContainer, false);
        this.checkColumn(closeCardsContainer, false);
    }
    openCard(card) {
        if (this.isAnimating) return;
        card.classList.remove('close');
        card.classList.add('open');
        this.addRankAndSuit(card);
        this.addBackgroundImage(card);
    }
    addBackgroundImage(card) {
        let suit = card.dataset.suit;
        let rank = card.dataset.rank;
        card.style.backgroundImage = `url(images/${rank}_of_${suit}.png)`;
        card.style.backgroundSize = 'contain';
    }
    startDrag(card) {
        if (this.isAnimating) return;
        this.DRAGGED_CARDS = [];
        const parent = card.parentNode;
        const currentIndex = card.style.zIndex;
        parent.querySelectorAll(`.open`).forEach(card => {
            if(card.style.zIndex >= Number(currentIndex)) this.DRAGGED_CARDS.push(card)
        });
        this.createClones(card);
    }
    createClones(card) {
        if (this.isAnimating) return;
        let i = 0;
        this.CURRENT_CORDS_CARD = card.getBoundingClientRect();
        this.DRAGGED_CARDS.forEach(card => {
            let clone = card.cloneNode();
            clone.style.position = 'absolute';
            clone.style.left = this.CURRENT_CORDS_CARD.left + 'px';
            clone.style.top = this.CURRENT_CORDS_CARD.top + (20 * i) + 'px';
            clone.style.zIndex = '9999';
            card.style.opacity = '0';
            document.body.appendChild(clone);
            this.CURRENT_CLONES.push(clone);
            
            i++
        });
        this.mouseUpHandler = (e) => this.stopDrag(this.CURRENT_CLONES[0], this.DRAGGED_CARDS[0]);
        document.addEventListener('mouseup', this.mouseUpHandler);
        this.mouseMoveHandler = (e) => this.moveClone(this.CURRENT_CLONES[0], e)
        document.addEventListener('mousemove', this.mouseMoveHandler);
    }
    stopDrag(clone, card) {
        if (this.isAnimating) return;
        document.removeEventListener('mousemove', this.mouseMoveHandler)
        document.removeEventListener('mouseup', this.mouseUpHandler)
        const cloneRect = clone.getBoundingClientRect();
        const centerCloneX = cloneRect.left + cloneRect.width / 2;
        const centerCloneY = cloneRect.top + cloneRect.height / 2;
        const elementsUnderClone = document.elementsFromPoint(centerCloneX, centerCloneY);
        let parent = null;

        for(let element of elementsUnderClone) {
            if(element === clone || element === document.body){
                continue;
            }
            const dragContainer = element.closest(`[data-drag-container]`)
            if(dragContainer) {
                if(dragContainer.dataset.dragContainer == 1 || dragContainer.dataset.dragContainer == 2) {
                    parent = dragContainer;
                    break;
                }
            }
            if(element.classList?.contains('game-cell')) {
                parent = element;
                break;
            }
            if(element.id == 'open-cards') {
                parent = element;
                break;
            }
        }
        if(!parent) {
            this.cancelDrag(clone, card);
            return
        }
        parent.classList.contains('game-cell') ? this.checkCardsInCell(card, parent, clone, 1) : this.checkCardsInCell(card, parent, clone, 0);
        this.CURRENT_CLONES = [];
    }
    cancelDrag(clone, card) {
        this.isAnimating = true;
        this.CURRENT_CLONES.forEach(clone => {
            this.returnCardAnimation()
            setTimeout(() => {
                clone.remove();
                this.DRAGGED_CARDS.forEach(card => {
                    card.style.opacity = '1';
                });
                this.isAnimating = false;
            }, 200)
        });
        this.CURRENT_CLONES = [];
    }
    returnCardAnimation() {
        for(let i = 0; i < this.CURRENT_CLONES.length; i++){
            const clone = this.CURRENT_CLONES[i];
            const card = this.DRAGGED_CARDS[i];

            const cordsClone = clone.getBoundingClientRect();
            const cordsCard = card.getBoundingClientRect();

            const deltaTop = cordsCard.top - cordsClone.top;
            const deltaLeft = cordsCard.left - cordsClone.left;

            clone.style.transition = 'transform 200ms ease';
            clone.style.transform = `translate(${deltaLeft}px, ${deltaTop}px)`;

            const onTransitionEnd = () => {
                clone.style.transition = '';
                clone.removeEventListener('transitionend', onTransitionEnd);
            };
            clone.addEventListener('transitionend', onTransitionEnd);
        }
    }
    checkColumn(parent, isGameCell, isShuffle = false) {
        const allChildrens = parent.childNodes;
        let i = 1;
        allChildrens.forEach(child => {
            child.style.zIndex = i;
            if(isGameCell) {
                if(i == 1) child.style.top = 0 + 'px';
                if(i > 1) child.style.top = 20 * (i - 1) + 'px';
            }else child.style.top = 0 + 'px';
            if(allChildrens[allChildrens.length - 1].classList.contains('close') &&
            Number(parent.dataset.dragContainer) == 1 &&
            isShuffle == false) {
                this.openCard(allChildrens[allChildrens.length - 1]);
            }
            i++
        });
    }
    moveClone(clone, e) {
        if (this.isAnimating) return;
        let i = 0;
        let cloneCoordinates = this.CURRENT_CLONES[0].getBoundingClientRect()
        this.CURRENT_CLONES.forEach(clone => {
            if(i == 0) {
                let differentY = this.CURRENT_CORDS_MOUSE.pageY - e.pageY;
                let differentX = this.CURRENT_CORDS_MOUSE.pageX - e.pageX;
    
                clone.style.left = this.CURRENT_CORDS_CARD.left - differentX + 'px';
                clone.style.top = this.CURRENT_CORDS_CARD.top - differentY + 'px';
            }else {
                clone.style.left = cloneCoordinates.left + 'px';
                clone.style.top = cloneCoordinates.top + (20 * i) + 'px';
            }
            i++
        });
    }
    randomCardsSettings() {
        let cardId = 1;
        for(const suit of suits) {
            for(const rank of ranks) {
                this.CARDS_SETTINGS[cardId] = {
                    RANK : rank,
                    SUIT : suit.name,
                    SUIT_GROUP : suit.group
                }
                cardId++;
            }
        }
        const entries = Object.entries(this.CARDS_SETTINGS);
        for (let i = entries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [entries[i], entries[j]] = [entries[j], entries[i]];
        }
        const shuffledObj = {};
        for (let i = 0; i < entries.length; i++) {
            shuffledObj[i + 1] = entries[i][1];
        }
        this.CARDS_SETTINGS = shuffledObj;
    }
    addRankAndSuit(card) {
        card.dataset.rank = this.CARDS_SETTINGS[Number(card.dataset.id) + 1].RANK;
        card.dataset.suit = this.CARDS_SETTINGS[Number(card.dataset.id) + 1].SUIT;
        card.dataset.suitGroup = this.CARDS_SETTINGS[Number(card.dataset.id) + 1].SUIT_GROUP;
    }
    checkCardsInCell(card, parent, clone, gameCell) {
        if (this.isAnimating) return;
        const childs = parent.childNodes;
        const lastChild = childs[childs.length - 1]
        if(lastChild != undefined) {
            if(gameCell) {
                if(card.dataset.suitGroup != lastChild.dataset.suitGroup && Number(lastChild.dataset.rank) - Number(card.dataset.rank) == 1) {
                    this.DRAGGED_CARDS.forEach(card => {
                        parent.appendChild(card);
                        card.style.opacity = '1';
                    });
                    parent.dataset.dragContainer == '1' ? this.checkColumn(parent, true) : this.checkColumn(parent, false)
                    this.CURRENT_CONTAINER.dataset.dragContainer == '1' ? this.checkColumn(this.CURRENT_CONTAINER, true) : this.checkColumn(this.CURRENT_CONTAINER, false);
                    this.CURRENT_CLONES.forEach(clone => {
                        clone.remove();
                    });
                }else {
                    this.cancelDrag(clone, card)
                }
            }else {
                if(this.CURRENT_CLONES.length > 1){
                    this.cancelDrag(clone, card)
                    return
                }
                if(card.dataset.suit == lastChild.dataset.suit && Number(lastChild.dataset.rank) - Number(card.dataset.rank) == -1) {
                    this.DRAGGED_CARDS.forEach(card => {
                        parent.appendChild(card);
                        card.style.opacity = '1';
                        this.finishGame();
                    });
                    parent.dataset.dragContainer == '1' ? this.checkColumn(parent, true) : this.checkColumn(parent, false)
                    this.CURRENT_CONTAINER.dataset.dragContainer == '1' ? this.checkColumn(this.CURRENT_CONTAINER, true) : this.checkColumn(this.CURRENT_CONTAINER, false);
                    this.CURRENT_CLONES.forEach(clone => {
                        clone.remove();
                    });
                }else {
                    this.cancelDrag(clone, card)
                }
            }
        }else {
            if(gameCell) {
                if(Number(card.dataset.rank) == 13) {
                    this.DRAGGED_CARDS.forEach(card => {
                        parent.appendChild(card);
                        card.style.opacity = '1';
                    });
                    parent.dataset.dragContainer == '1' ? this.checkColumn(parent, true) : this.checkColumn(parent, false)
                    this.CURRENT_CONTAINER.dataset.dragContainer == '1' ? this.checkColumn(this.CURRENT_CONTAINER, true) : this.checkColumn(this.CURRENT_CONTAINER, false);
                    this.CURRENT_CLONES.forEach(clone => {
                        clone.remove();
                    });
                }else {
                    this.cancelDrag(clone, card)
                }
            }else {
                if(Number(card.dataset.rank) == 1) {
                    this.DRAGGED_CARDS.forEach(card => {
                        parent.appendChild(card);
                        card.style.opacity = '1';
                    });
                    parent.dataset.dragContainer == '1' ? this.checkColumn(parent, true) : this.checkColumn(parent, false)
                    this.CURRENT_CONTAINER.dataset.dragContainer == '1' ? this.checkColumn(this.CURRENT_CONTAINER, true) : this.checkColumn(this.CURRENT_CONTAINER, false);
                    this.CURRENT_CLONES.forEach(clone => {
                        clone.remove();
                    });
                }else {
                    this.cancelDrag(clone, card)
                }
            }
        }
    }
    finishGame() {
        const allCardSlots = document.querySelectorAll('.card-slot');
        let i = 0;
        allCardSlots.forEach(cardSlot => {
            if(cardSlot.childElementCount == 13) i++;
        });
        if(i == 4) {
            document.getElementById('end-game-container').style.display = 'flex';
        }
    }
    returnCards(e) {
        if (this.isAnimating) return;

        if (closeCardsContainer.children.length > 0) {
            this.moveToOpenContainer(closeCardsContainer);
            return;
        }

        if (openCardsContainer.children.length > 0) {
            const cards = [...openCardsContainer.childNodes].reverse();

            cards.forEach(card => {
                if (!card.classList?.contains('card')) return;

                card.style.pointerEvents = 'none';
                card.classList.remove('open');
                card.classList.add('close');
                card.innerHTML = '';
                card.style.backgroundColor = '#808080';
                card.style.backgroundImage = 'unset';
                card.dataset.suitGroup = '';
                card.dataset.suit = '';
                card.dataset.rank = '';
                closeCardsContainer.appendChild(card);
            });

            this.checkColumn(closeCardsContainer, false);
        }
    }
    shuffleCards(){
        let wastedCards = 0;
        for(let i = 0; i < 7; i++) {
            for(let k = 0; k < 7; k++) {
                if(i > k) continue
                const currentContainer = gameCellsContainer[k];
                currentContainer.appendChild(this.ALL_CARDS[51 - wastedCards])
                wastedCards++;
                if(i == k) {
                    this.checkColumn(currentContainer, true)
                    continue
                }
                this.checkColumn(currentContainer, true, true)
            }
        }
    }
}