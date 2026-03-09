function toggleCard(element) {
    const todosOsCards = document.querySelectorAll('.card-tech');
    todosOsCards.forEach(card => {
        if (card !== element) card.classList.remove('active');
    });
    element.classList.toggle('active');
}