const closeCardsContainer = document.getElementById('close-cards');
const openCardsContainer = document.getElementById('open-cards');
const cardSlotsContainer = document.querySelectorAll('.card-slot');
const gameCellsContainer = document.querySelectorAll('.game-cell');
const suits = [
    { name: "Clubs", group: "BLACK" },
    { name: "Spades", group: "BLACK" },
    { name: "Hearts", group: "RED" },
    { name: "Diamonds", group: "RED" }
];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];

export default class Game {
    CARDS_SETTINGS = {};
    CURRENT_CARD;
    CURRENT_CONTAINER;
    CURRENT_CORDS_CARD;
    CURRENT_CORDS_MOUSE;
    constructor() {
        this.createCards();
        closeCardsContainer.addEventListener('click', this.returnCards.bind(this))
    }

    createCards() {
        for(let i = 0; i < 52; i++) {
            const rowCard = document.createElement('div')
            rowCard.style.zIndex = i + 1;
            rowCard.classList.add('card');
            rowCard.classList.add('close');
            rowCard.dataset.id = i;
            closeCardsContainer.appendChild(rowCard);
            rowCard.ondragstart = function() {
                return false;
            };
            this.mouseDownHandler = (e) => this.mouseDown(rowCard, e);
            rowCard.addEventListener('mousedown', this.mouseDownHandler);
        }
        this.randomCardsSettings()
    }
    mouseDown(card, e) {
        this.CURRENT_CORDS_MOUSE = e;
        this.CURRENT_CONTAINER = card.parentNode;
        if(card.classList.contains('open')) {
            this.startDrag(card);
        }else {
            if(card.parentNode == closeCardsContainer) {
                this.moveToOpenContainer(card);
            }
        }
    }
    moveToOpenContainer(card) {
        let clone = card.cloneNode();
        clone.style.position = 'absolute';
        this.CURRENT_CORDS_CARD = card.getBoundingClientRect();
        const targetCoordinates = openCardsContainer.getBoundingClientRect();
        clone.style.left = this.CURRENT_CORDS_CARD.left + 'px';
        clone.style.top = this.CURRENT_CORDS_CARD.top + 'px';
        
        document.body.appendChild(clone);
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        clone.style.transform = `translate(${targetCoordinates.left - this.CURRENT_CORDS_CARD.left}px, ${targetCoordinates.top - this.CURRENT_CORDS_CARD.top})`
    
        setTimeout(() => {
            clone.remove();
            openCardsContainer.appendChild(card);
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            this.openCard(card);
            this.checkColumn(openCardsContainer, false)
            this.checkColumn(closeCardsContainer, false)
        }, 200)
    }
    openCard(card) {
        card.classList.remove('close');
        card.classList.add('open');
        this.addRankAndSuit(card);
    }
    closeCard() {
        const allChildrens = closeCardsContainer.childNodes;
        for (let i = allChildrens.length - 1; i > -1; i--) {
            allChildrens[i].innerHTML = '';
            allChildrens[i].style.backgroundColor = '#808080';
            allChildrens[i].classList.remove('open');
            allChildrens[i].classList.add('close');
            allChildrens[i].dataset.suitGroup = '';
            allChildrens[i].dataset.suit = '';
            allChildrens[i].dataset.rank = '';
        }
    }
    startDrag(card) {
        let clone = card.cloneNode();
        clone.style.position = 'absolute';
        this.CURRENT_CORDS_CARD = card.getBoundingClientRect();
        clone.style.left = this.CURRENT_CORDS_CARD.left + 'px';
        clone.style.top = this.CURRENT_CORDS_CARD.top + 'px';
        clone.style.zIndex = '9999';
        card.style.opacity = '0';
        document.body.appendChild(clone);
        this.mouseUpHandler = (e) => this.stopDrag(clone, card);
        document.addEventListener('mouseup', this.mouseUpHandler);

        this.mouseMoveHandler = (e) => this.moveClone(clone, e)
        document.addEventListener('mousemove', this.mouseMoveHandler)
    }
    stopDrag(clone, card) {
        document.removeEventListener('mousemove', this.mouseMoveHandler)
        document.removeEventListener('mouseup', this.mouseUpHandler)
        
        const cloneRect = clone.getBoundingClientRect();
        const centerCloneX = cloneRect.left + cloneRect.width / 2;
        const centerCloneY = cloneRect.top + cloneRect.height / 2;
        const elementUnderClone = document.elementsFromPoint(centerCloneX, centerCloneY)[1];
        let parent;

        if(elementUnderClone.classList.contains('card')) parent = elementUnderClone.parentNode;
            else parent = elementUnderClone;
        if(parent.dataset.dragContainer != '1' && parent.dataset.dragContainer != '2') {
            this.cancelDrag(clone, card);
            return
        }
        this.checkCardsInCell(card, parent, clone)
    }
    cancelDrag(clone, card) {
        clone.remove();
        card.style.opacity = '1';
    }
    checkColumn(parent, isGameCell) {
        const allChildrens = parent.childNodes;
        let i = 1;
        allChildrens.forEach(child => {
            child.style.zIndex = i;
            if(isGameCell) {
                if(i == 1) child.style.top = 0 + 'px';
                if(i > 1) child.style.top = 20 * (i - 1) + 'px';
            }else child.style.top = 0 + 'px';
            child.style.pointerEvents = 'none';
            if(i == allChildrens.length) child.style.pointerEvents = 'auto';
            i++
        });
    }
    moveClone(clone, e) {
        let differentY = this.CURRENT_CORDS_MOUSE.pageY - e.pageY;
        let differentX = this.CURRENT_CORDS_MOUSE.pageX - e.pageX;
        clone.style.left = this.CURRENT_CORDS_CARD.left - differentX + 'px';
        clone.style.top = this.CURRENT_CORDS_CARD.top - differentY + 'px';
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
        card.style.backgroundColor = `${card.dataset.suitGroup}`;
        if(card.dataset.suitGroup == "BLACK") card.style.color = "white"
        card.innerHTML = `${card.dataset.rank}`;
    }
    checkCardsInCell(card, parent, clone) {
        const childs = parent.childNodes;
        const lastChild = childs[childs.length - 1]
        if(lastChild != undefined) {
            if(card.dataset.suitGroup != lastChild.dataset.suitGroup && Number(lastChild.dataset.rank) - Number(card.dataset.rank) == 1) {
                parent.appendChild(card);
                parent.dataset.dragContainer == '1' ? this.checkColumn(parent, true) : this.checkColumn(parent, false)
                card.style.opacity = '1';
                this.CURRENT_CONTAINER.dataset.dragContainer == '1' ? this.checkColumn(this.CURRENT_CONTAINER, true) : this.checkColumn(this.CURRENT_CONTAINER, false);
                clone.remove();
            }else {
                this.cancelDrag(clone, card)
            }
        }else {
            if(Number(card.dataset.rank) == 13) {
                parent.appendChild(card);
                parent.dataset.dragContainer == '1' ? this.checkColumn(parent, true) : this.checkColumn(parent, false)
                card.style.opacity = '1';
                this.CURRENT_CONTAINER.dataset.dragContainer == '1' ? this.checkColumn(this.CURRENT_CONTAINER, true) : this.checkColumn(this.CURRENT_CONTAINER, false);
                clone.remove()
            }else {
                this.cancelDrag(clone, card)
            }
        }
    }
    returnCards() {
        if(closeCardsContainer.children.length == 0){
            const allChildrens = openCardsContainer.childNodes;
            for (let i = allChildrens.length - 1; i > -1; i--) {
                closeCardsContainer.appendChild(allChildrens[i])
            }

            this.closeCard();
            this.checkColumn(closeCardsContainer, false)
        }
    }
}