const closeCardsContainer = document.getElementById('close-cards');
const openCardsContainer = document.getElementById('open-cards');
const cardSlotsContainer = document.querySelectorAll('.card-slot');
const gameCellsContainer = document.querySelectorAll('.game-cell');

export default class Game {
    CARDS = [];
    CURRENT_CARD;
    CURRENT_CORDS_CARD;
    CURRENT_CORDS_MOUSE;
    constructor() {
        this.createCards();
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
            this.mouseDown(rowCard);
        }
    }
    mouseDown(card) {
        card.addEventListener('mousedown', (e) => {
            this.CURRENT_CORDS_MOUSE = e;
            if(card.classList.contains('open')) {
                this.startDrag(card);
            }else {
                if(card.parentNode == closeCardsContainer) {
                    this.moveToOpenContainer(card);
                }
            }
        })
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
        card.classList.add('open');
    
        setTimeout(() => {
            clone.remove();
            openCardsContainer.appendChild(card);
            card.classList.remove('close');
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        }, 200)
        
    }
    startDrag(card) {
        let clone = card.cloneNode();
        clone.style.position = 'absolute';
        this.CURRENT_CORDS_CARD = card.getBoundingClientRect();
        console.log(this.CURRENT_CORDS_CARD.left)
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
        console.log(document.elementsFromPoint(centerCloneX, centerCloneY))
        const elementUnderClone = document.elementsFromPoint(centerCloneX, centerCloneY)[1];
        let parent;
        if(elementUnderClone.classList.contains('card')) {
            parent = elementUnderClone.parentNode;
            if(parent === openCardsContainer || closeCardsContainer){
                console.log('пипяу')
                clone.remove();
                card.style.opacity = '1';
                return
            }
            parent.appendChild(card);
            clone.remove();
            this.checkColumn(parent);
            card.style.opacity = '1';
        }else {
            parent = elementUnderClone;
            console.log(parent.id)
            if(parent.id == 'close-cards' || 'open-cards'){
                console.log('пипяу')
                console.log(openCardsContainer)
                console.log(closeCardsContainer)
                console.log(parent)
                clone.remove();
                card.style.opacity = '1';
                return
            }
            elementUnderClone.appendChild(card);
            clone.remove();
            this.checkColumn(parent);
            card.style.opacity = '1';
        }
    }
    checkColumn(parent) {
        console.log(parent.childNodes.length)
        const allChildrens = parent.childNodes;
        let i = 1;
        allChildrens.forEach(child => {
            child.style.zIndex = i;
            if(i == 1) {
                i++
                return
            };
            child.style.top = 20 * (i - 1) + 'px';
            i++
            console.log(child)
        });
        console.log(parent)
        console.log(parent.childNodes)
    }
    moveClone(clone, e) {
        let differentY = this.CURRENT_CORDS_MOUSE.pageY - e.pageY;
        let differentX = this.CURRENT_CORDS_MOUSE.pageX - e.pageX;
        clone.style.left = this.CURRENT_CORDS_CARD.left - differentX + 'px';
        clone.style.top = this.CURRENT_CORDS_CARD.top - differentY + 'px';
    }
}
